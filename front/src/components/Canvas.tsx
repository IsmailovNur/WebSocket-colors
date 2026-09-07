import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";

interface Pixel {
  x: number;
  y: number;
  color: string;
}

const CIRCLE_RADIUS = 5;
const COLORS = [
  "#000000",
  "#da2222",
  "#17f417",
  "#0202e8",
  "#f1b536",
  "#cf8300",
  "#d22ef1",
  "#FFFFFF"
];

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const currentStrokeRef = useRef<Pixel[]>([]);

  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);


  const drawCircle = (ctx: CanvasRenderingContext2D, pixel: Pixel) => {
    ctx.beginPath();
    ctx.arc(pixel.x, pixel.y, CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = pixel.color;
    ctx.fill();
    ctx.closePath();
  };

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8888/colors");
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        if (!ctx) return;

        if (data.type === "INIT") {
          clearLocalCanvas();
          data.payload.forEach((pixel: Pixel) => drawCircle(ctx, pixel));
        } else if (data.type === "NEW_POINTS") {
          data.payload.forEach((pixel: Pixel) => drawCircle(ctx, pixel));
        } else if (data.type === "CLEAR") {
          clearLocalCanvas();
        }
      } catch (err) {
        console.error("Ошибка чтения сообщения WebSocket:", err);
      }
    };
    return () => {
      socket.close();
    };
  }, []);


  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return {x: 0, y: 0};
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };


  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const {x, y} = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const newPixel: Pixel = {x, y, color: selectedColor};

    currentStrokeRef.current = [newPixel];

    if (ctx) {
      drawCircle(ctx, newPixel);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const {x, y} = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const newPixel: Pixel = {x, y, color: selectedColor};

    currentStrokeRef.current.push(newPixel);

    if (ctx) {
      drawCircle(ctx, newPixel);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (
      socketRef.current && currentStrokeRef.current.length > 0
    ) {
      socketRef.current.send(
        JSON.stringify({
          type: "DRAW_POINTS",
          payload: currentStrokeRef.current,
        })
      );
    }

    currentStrokeRef.current = [];
  };

  const handleClear = () => {
    socketRef.current.send(
      JSON.stringify({
        type: "CLEAR",
      })
    );
  };

  return (
    <Container maxWidth="md" sx={{py: 4}}>
      <Paper sx={{p: 3}}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            flexDirection: "row",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body1">Color:</Typography>
          {COLORS.map((color) => (
            <Box
              key={color}
              onClick={() => setSelectedColor(color)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: color,
                cursor: "pointer",
                border: selectedColor === color ? "3px solid #fff" : "1px solid #ccc",
                transform: selectedColor === color ? "scale(1.2)" : "scale(1)",
                transition: "all 0.15s ease-in-out",
              }}
            />
          ))}
          <Button
            variant="outlined"
            color="error"
            sx={{ml: "auto"}}
            onClick={handleClear}
          >
            Clear
          </Button>
        </Box>

        <Box sx={{display: "inline-block", borderRadius: 1}}>
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              cursor: "crosshair",
              display: "block",
              border: "2px solid #000",
              backgroundColor: "#fff",
              borderRadius: "10px",
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
};