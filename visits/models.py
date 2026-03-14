from django.db import models


class Visit(models.Model):
    day = models.CharField(max_length=10)  # e.g. "sun-15"
    name = models.CharField(max_length=100)
    time_text = models.CharField(max_length=200)
    bringing = models.CharField(max_length=200, blank=True)
    tags = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} on {self.day}"


class TagVote(models.Model):
    day = models.CharField(max_length=10)
    tag = models.CharField(max_length=50)
    voter_name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('day', 'tag', 'voter_name')

    def __str__(self):
        return f"{self.voter_name} voted {self.tag} on {self.day}"
