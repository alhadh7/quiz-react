import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Quiz from './components/quiz';

function App() {


  return (
    <>
          <BrowserRouter>
      <Routes>
        <Route>
          <Route path="/" element={<Quiz />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
