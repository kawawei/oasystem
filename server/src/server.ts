import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initializeDatabase } from './config/database'
import app from './app'

console.log('Environment variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME
})

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`Database: ${process.env.DB_NAME}`)
}) 