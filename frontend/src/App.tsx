import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Box, Button, Heading, HStack, Input, Stack, Text, VStack } from '@chakra-ui/react'
import useSWR, { mutate } from 'swr'

const API = 'http://localhost:8080'
const fetcher = (url: string) => fetch(`${API}${url}`).then((response) => response.json())

export const App: React.FC = () => {
  const ws = useRef<WebSocket | null>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ type: string; message: string }[]>([])
  const [content, setContent] = useState<{ message: string; time: string } | undefined>(undefined)
  const { data, error, isLoading } = useSWR(`/api/hello`, fetcher)

  const handleClickApi = useCallback(async () => {
    if (error) {
      console.error(error)
      return
    }
    setContent(data)
    await mutate(`/api/hello`)
    console.log(`${API}/api/hello`)
    console.log(data)
  }, [data, error])

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080/chat')
    if (ws.current == null) return
    ws.current.onopen = () => {
      console.log('Connected')
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(event)
      console.info('Message received:', data)
      setMessages((prev) => [...prev, { type: data.type, message: data.message }])
    }

    ws.current.onclose = () => {
      console.log('Disconnected')
      setTimeout(() => {
        console.log('Reconnecting...')
        ws.current = new WebSocket('ws://localhost:8080/chat')
      }, 3000)
    }

    return () => {
      ws.current?.close()
    }
  }, [])

  const sendMessage = useCallback(() => {
    if (!ws.current) return
    ws.current.send(message)
    setMessages((prev) => [...prev, { type: 'client', message: message }])
    setMessage('')
  }, [message])

  return (
    <Box bg='#ccc' px='3' py='5'>
      <Heading as='h1' size='4xl'>
        React + Golang
      </Heading>
      <HStack>
        <Button onClick={handleClickApi} isDisabled={isLoading} colorScheme='blue'>
          API
        </Button>
        <Text>
          {JSON.stringify(content?.message)}/{JSON.stringify(content?.time)}
        </Text>
      </HStack>

      <Stack gap='3' bg='gray.900' h='600px' overflow='scroll' px='2' py='4'>
        {messages.map((msg, index) => (
          <VStack alignItems={msg.type === 'server' ? 'flex-start' : 'flex-end'}>
            {/* <Text justifyContent='flex-end'>{msg.type}</Text> */}
            <Box
              key={index}
              rounded='xl'
              bg={msg.type === 'server' ? 'blue.400' : 'gray.500'}
              color='white'
              px='3'
              py='4'
            >
              {msg.message}
            </Box>
          </VStack>
        ))}
      </Stack>
      <HStack>
        <Input type='text' value={message} onChange={(event) => setMessage(event.target.value)} />
        <Button onClick={sendMessage}>Send</Button>
      </HStack>
    </Box>
  )
}
