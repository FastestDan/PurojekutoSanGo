from django.db import models


# Create your models here.
from django.urls import reverse


class Leaderboard(models.Model):
    """
    Model representing a book (but not a specific copy of a book).
    """
    nickname = models.CharField(max_length=150)
    score = models.IntegerField(default=0)

    def __str__(self):
        """
        String for representing the Model object.
        """
        return self.nickname
    #
    #
    # def get_absolute_url(self):
    #     """
    #     Returns the url to access a particular book instance.
    #     """
    #     return reverse('gamer-info', args=[self.nickname])