import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from django_ratelimit.decorators import ratelimit

from .models import Visit, TagVote


def index(request):
    return render(request, 'index.html')


@require_http_methods(["GET", "POST"])
def api_visits(request):
    if request.method == "GET":
        visits = list(
            Visit.objects.all().order_by('created_at').values(
                'id', 'day', 'name', 'time_text', 'bringing', 'tags', 'created_at'
            )
        )
        return JsonResponse(visits, safe=False)

    # POST
    @ratelimit(key='ip', rate='30/h', method='POST', block=True)
    def _create(request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        name = data.get('name', '').strip()
        day = data.get('day', '').strip()
        time_text = data.get('time_text', '').strip()
        bringing = data.get('bringing', '').strip()
        tags = data.get('tags', [])

        if not name or not day or not time_text:
            return JsonResponse({'error': 'name, day, and time_text are required'}, status=400)
        if len(name) > 100 or len(day) > 10 or len(time_text) > 200 or len(bringing) > 200:
            return JsonResponse({'error': 'Field too long'}, status=400)
        if not isinstance(tags, list) or len(tags) > 10:
            return JsonResponse({'error': 'Invalid tags'}, status=400)

        allowed_tags = {'entertainment', 'games', 'movies', 'food', 'snacks', 'tea'}
        tags = [t for t in tags if t in allowed_tags]

        visit = Visit.objects.create(
            name=name, day=day, time_text=time_text, bringing=bringing, tags=tags
        )
        return JsonResponse({
            'id': visit.id, 'day': visit.day, 'name': visit.name,
            'time_text': visit.time_text, 'bringing': visit.bringing,
            'tags': visit.tags, 'created_at': visit.created_at.isoformat()
        }, status=201)

    return _create(request)


@require_http_methods(["DELETE"])
def api_visit_delete(request, visit_id):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    name = data.get('name', '').strip()
    try:
        visit = Visit.objects.get(id=visit_id)
    except Visit.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if visit.name != name:
        return JsonResponse({'error': 'Not your visit'}, status=403)

    visit.delete()
    return JsonResponse({'ok': True})


@require_http_methods(["GET", "POST"])
def api_votes(request):
    if request.method == "GET":
        votes = list(TagVote.objects.all().values('day', 'tag', 'voter_name'))
        return JsonResponse(votes, safe=False)

    # POST — toggle vote
    @ratelimit(key='ip', rate='60/h', method='POST', block=True)
    def _toggle(request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        day = data.get('day', '').strip()
        tag = data.get('tag', '').strip()
        voter_name = data.get('voter_name', '').strip()

        if not day or not tag or not voter_name:
            return JsonResponse({'error': 'day, tag, and voter_name required'}, status=400)

        existing = TagVote.objects.filter(day=day, tag=tag, voter_name=voter_name)
        if existing.exists():
            existing.delete()
            return JsonResponse({'action': 'removed'})
        else:
            TagVote.objects.create(day=day, tag=tag, voter_name=voter_name)
            return JsonResponse({'action': 'added'}, status=201)

    return _toggle(request)
