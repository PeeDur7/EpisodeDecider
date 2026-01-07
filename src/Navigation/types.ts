export type RootStackParamList = {
    Login: undefined;
    Registration: undefined;
    Welcome: undefined;
    Home : undefined;
    ForgotPassword : undefined;
    Search : undefined;
    Settings : undefined;
    ShowInfo : {
      showId : number;
      showPoster? : string;
      showTitle : string;
      firstAirDate : string;
    };
    ShowRedirect : {
      showTitle : string;
      episodeNum : string;
      seasonNum : string;
    };
  };
  