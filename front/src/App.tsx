import './App.css'
import {
  createTheme,
  CssBaseline,
  ThemeProvider,
  Typography
} from "@mui/material";
import { Canvas } from "./components/Canvas.tsx";

export const App = () => {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Typography variant="h2" sx={{mb: 2}}>Online colors!</Typography>
        <Canvas />
      </ThemeProvider>

    </>
  )
}
