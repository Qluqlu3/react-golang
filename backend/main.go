package main

import (
	"log"

	"react-golang/backend/httpHandlers"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.GET("/api/hello", httpHandlers.HelloHandler)
	router.GET("/chat", httpHandlers.HandleConnection)
	log.Println("Server is starting on http://localhost:8080\n")
	// mux := http.NewServeMux()
	// mux.HandleFunc("/api/hello", httpHandlers.HelloHandler)
	// mux.HandleFunc("/chat", httpHandlers.HandleConnection)

	// corsHandler := handlers.CORS(
	// 	handlers.AllowedOrigins([]string{"http://localhost:3000"}),
	// 	handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
	// 	handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	// )(mux)

	// fmt.Printf("Server is starting on http://localhost:8080\n")
	// err := http.ListenAndServe(":8080", corsHandler)
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("erver failed to start: %v", err)
	}
}
