export type RootStackParamList = {
    Login: undefined;
    Registration: undefined;
    Welcome: undefined;
    Home : undefined;
    ForgotPassword : undefined;
    Search : undefined;
    Settings : undefined;
    ShowList : {showTitle : string};
    ShowInfo : {showId : number};
    ShowRedirect : {
      showTitle : string;
      episodeNum : string;
      seasonNum : string;
    };
  };
  