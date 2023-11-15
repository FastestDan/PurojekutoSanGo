import json

from django.http import HttpResponse
from django.shortcuts import render

from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views import generic
from .models import Leaderboard


class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"


import sqlite3


class LBoard(generic.ListView):
    model = Leaderboard
    paginate_by = 10
    template_name = "lboard.html"


def catchend(request):
    signal = request.POST['score']
    user = request.user.username
    lbchange(user, signal)
    response = json.dumps({
        'status': 'ok',
    })

    return HttpResponse(response)


def lbchange(user, score):
    a = sqlite3.connect('db.sqlite3')
    cur = a.cursor()
    nicks = cur.execute("""SELECT nickname FROM accounts_leaderboard""").fetchall()
    if user not in nicks[0][0]:
        cur.execute("""INSERT INTO accounts_leaderboard(nickname,score) VALUES(?, ?)""", (user, score,))
    else:
        prev = cur.execute("""SELECT score FROM accounts_leaderboard WHERE nickname=?""", (user,))
        if prev < score:
            cur.execute("""UPDATE accounts_leaderboard SET score=? WHERE nickname=?""", (score, user,))
    a.commit()
    a.close()
