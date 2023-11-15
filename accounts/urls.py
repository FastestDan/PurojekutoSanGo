from django.urls import path

from .views import SignUpView, LBoard, lbchange


urlpatterns = [
    path("signup/", SignUpView.as_view(), name="signup"),
    path("leaderboards/", LBoard.as_view(), name="lboard"),
    path("end-game", lbchange, name='end-game')
]