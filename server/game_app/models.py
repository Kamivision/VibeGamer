from django.db import models

# Create your models here.
class Game(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    genre = models.CharField(max_length=100)
    tags = models.CharField(max_length=255)
    playtime = models.DurationField()
  

    def __str__(self):
        return self.title