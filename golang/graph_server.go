package main

import (
	"encoding/json"
	"html/template"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const (
	PREFIX     = "graph-"
	UPLOAD_DIR = "./graphs"
)

type GraphList struct {
	Graphs []Graph `json:"graphs"`
}

type Graph struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

var errorTemplate, _ = template.ParseFiles("error.html")

func check(err error) {
	if err != nil {
		panic(err)
	}
}

func uploadErrorHandler(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if e, ok := recover().(error); ok {
				w.WriteHeader(200)
				w.Header().Set("Content-Type", "application/json")
				w.Write([]byte(`{"success": false, "error": "` + e.Error() + `"}`))
			}
		}()
		fn(w, r)
	}
}

func errorHandler(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if e, ok := recover().(error); ok {
				w.WriteHeader(200)
				w.Header().Set("Content-Type", "application/json")
				w.Write([]byte(`{"success": false, "error": "` + e.Error() + `"}`))
			}
		}()
		fn(w, r)
	}
}

func Basename(fileName string) string {
	return strings.TrimSuffix(filepath.Base(fileName), filepath.Ext(fileName))
}

func listDirectory(w http.ResponseWriter) {
	list := make([]Graph, 0)
	files, err := ioutil.ReadDir(UPLOAD_DIR)
	check(err)
	for _, f := range files {
		if f.IsDir() == false && filepath.Ext(f.Name()) == ".json" {
			fileName := f.Name()
			g := Graph{fileName, Basename(fileName)}
			list = append(list, g)
		}
	}
	gl := GraphList{list}
	enc := json.NewEncoder(w)
	enc.Encode(gl)

}

func upload(w http.ResponseWriter, r *http.Request) {
	f, fh, err := r.FormFile("graph")
	fileName := fh.Filename
	log.Println("Filename: ", fileName)
	check(err)
	defer f.Close()
	t, err := os.Create(filepath.Join(UPLOAD_DIR, fileName))
	check(err)
	defer t.Close()
	_, err = io.Copy(t, f)
	uuid := Basename(fileName)
	check(err)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success": true, "newUUID": "` + uuid + `"}`))
}

func view(w http.ResponseWriter, r *http.Request) {

	id := r.FormValue("id")
	if id != "" {
		fileStr := filepath.Join(UPLOAD_DIR, r.FormValue("id")) + ".json"
		log.Println("Serve graph file: ", fileStr)
		w.Header().Set("Content-Type", "application/json")
		http.ServeFile(w, r, fileStr)
	} else {
		listDirectory(w)
	}

}

func main() {
	http.HandleFunc("/upload", uploadErrorHandler(upload))
	http.HandleFunc("/view", errorHandler(view))
	http.Handle("/", http.FileServer(http.Dir("../dist/")))
	http.ListenAndServe(":9400", nil)
}
