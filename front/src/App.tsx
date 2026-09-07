import './App.css'
import { Typography } from "@mui/material";
import { Canvas } from "./components/Canvas.tsx";

export const App = () => {

  return (
    <>
      <Typography variant="h2" sx={{mb:2}}>Online colors!</Typography>
        <Canvas/>
    </>
  )
}
