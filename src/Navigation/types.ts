export type RootStackParamList = {
    Login: undefined;
    Registration: undefined;
    Welcome: undefined;
    ForgotPassword : undefined;
    NavBar: { screen: 'Home' | 'Search' | 'Settings' } | undefined;
    ShowInfo : {
      showId : number;
      showPoster? : string;
      showTitle : string;
      firstAirDate : string;
    };
    ShowRedirect : {
      showTitle : string;
      showId : number;
      episodeName : string;
      showPoster? : string;
      episodeNum : number;
      seasonNum : number;
      overview : string;
      runTime : number;
      firstAirDate : string;
    };
  };
  