package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var (
	// authKey = []byte(securecookie.GenerateRandomKey(32))
	// encKey  = []byte(securecookie.GenerateRandomKey(32))

	//store = sessions.NewCookieStore(authKey, encKey)

	GoogleOauthConfig = &oauth2.Config{

		RedirectURL:  "http://localhost:4747/Callback",
		ClientID:     "91816899551-4cl793p6prmsq0kebrjlv4v3ds86nk08.apps.googleusercontent.com",
		ClientSecret: ":M5nu5jtRtnNbGPfJXawxLSZy",
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"},
		Endpoint:     google.Endpoint,
	}
	oauthStateString string
)

func randToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.StdEncoding.EncodeToString(b)
}
func HandleGoogleLogin(w http.ResponseWriter, r *http.Request) {

	oauthStateString = randToken()
	url := GoogleOauthConfig.AuthCodeURL(oauthStateString)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)

}
func Callback(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	code := r.FormValue("code")
	token, err := GoogleOauthConfig.Exchange(ctx, code)
	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	fmt.Println(token, response, err)
	http.Redirect(w, r, "/", http.StatusFound)
}

func MainPage(w http.ResponseWriter, r *http.Request) {

	t, _ := template.ParseFiles("Templates/Chat1.html")
	w.Header().Set("Content-Type", "text/html")
	t.Execute(w, nil)
}
func UserInput(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Chat Calling")
	w.Header().Set("Content-Type", "text/html")
	t, _ := template.ParseFiles("Templates/userinput.html")
	t.Execute(w, nil)
}
func makecall(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Chat Calling")
	w.Header().Set("Content-Type", "text/html")
	t, _ := template.ParseFiles("Templates/VideoChat.html")
	t.Execute(w, nil)
}

func main() {

	mux := http.NewServeMux()
	mux.Handle("/Login", http.HandlerFunc(HandleGoogleLogin))
	mux.Handle("/", http.HandlerFunc(MainPage))
	mux.Handle("/UserInput", http.HandlerFunc(UserInput))
	mux.Handle("/Call", http.HandlerFunc(makecall))
	mux.Handle("/JS/", http.StripPrefix("/JS/", http.FileServer(http.Dir("Templates/JS"))))
	mux.Handle("/CSS/", http.StripPrefix("/CSS/", http.FileServer(http.Dir("Templates/CSS"))))
	mux.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("Templates/images"))))
	log.Println("Listening...")

	http.ListenAndServe(GetPort(), mux)

}
func GetPort() string {
	// var port = os.Getenv("PORT")
	// if port == "" {
		// port = "4747"
		// fmt.Println("INFO: No PORT environment variable detected, defaulting to " + port)
	// }

	// fmt.Println("Running Port is" + port)
	return ":" + "8080"
}
