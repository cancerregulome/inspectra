package main

import "net/http"
import "html/template"
import "io"
import "io/ioutil"
import "path/filepath"
import "encoding/json"

const (
	PREFIX     = "graph-"
	UPLOAD_DIR = "./graphs"
)

type GraphList struct {
	Graphs []Graph `json:"graphs"`
}

type Graph struct {
	Name string `json:"name"`
}

var errorTemplate, _ = template.ParseFiles("error.html")

func check(err error) {
	if err != nil {
		panic(err)
	}
}

func errorHandler(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if e, ok := recover().(error); ok {
				w.WriteHeader(500)
				errorTemplate.Execute(w, e)
			}
		}()
		fn(w, r)
	}
}

func listDirectory(w http.ResponseWriter) {
	list := make([]Graph, 1)
	files, err := ioutil.ReadDir(UPLOAD_DIR)
	check(err)
	for _, f := range files {
		if f.IsDir() == false && filepath.Ext(f.Name()) == "json" {
			g := Graph{filepath.Base(f.Name())}
			list = append(list, g)
		}
	}
	gl := GraphList{list}
	enc := json.NewEncoder(w)
	enc.Encode(gl)

}

func upload(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		listDirectory(w)
		return
	}
	f, _, err := r.FormFile("graph")
	check(err)
	defer f.Close()
	t, err := ioutil.TempFile(UPLOAD_DIR, PREFIX)
	check(err)
	defer t.Close()
	_, err = io.Copy(t, f)
	check(err)
	http.Redirect(w, r, "/view?id="+t.Name()[len(PREFIX):], 302)
}

func view(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	http.ServeFile(w, r, PREFIX+r.FormValue("id"))
}

func main() {
	http.HandleFunc("/", errorHandler(upload))
	http.HandleFunc("/view", errorHandler(view))
	http.ListenAndServe(":8080", nil)
}
