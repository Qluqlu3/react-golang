package httpHandlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Message struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

var upgraded = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HelloHandler(c *gin.Context) {
	response := map[string]string{
		"message": "Hello form Golang Gin",
		"time":    time.Now().Format("2006-01-02 15:04:05"),
	}
	c.JSON(http.StatusOK, response)
	// response := map[string]string{"message": "Hello form Golang!", "time": time.Now().Format("2006-01-02 15:04:05")}
	// responseWriter.WriteHeader((http.StatusOK))
	// json.NewEncoder(responseWriter).Encode(response)
}

func HandleConnection(c *gin.Context) {
	ws, err := upgraded.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Fatalf("Error upgrading: %v", err)
	}
	defer ws.Close()

	log.Println("Client connected")
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	go func() {
		for {
			_, message, err := ws.ReadMessage()
			if err != nil {
				log.Println("ReadMessage error:", err)
				break
			}
			log.Printf("Received: %s\n", message)
		}
	}()

	for {
		select {
		case <-ticker.C:
			message := Message{
				Type:    "server",
				Message: "Hello from server",
			}
			jsonMsg, err := json.Marshal(message)
			if err != nil {
				log.Println("JSON Marshal error:", err)
				return
			}
			err = ws.WriteMessage(websocket.TextMessage, jsonMsg)
			if err != nil {
				log.Println("WriteMessage error:", err)
				return
			}
		}
	}
}
