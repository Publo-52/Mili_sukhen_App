import { TurtleCreation } from '@/types';

export const INITIAL_TURTLE_CREATIONS: TurtleCreation[] = [
  {
    id: "turtle-love-app",
    title: "For My Mili (Floating Hearts & Typewriter Love App)",
    slug: "for-my-mili-love-app",
    description: "A custom Python Tkinter GUI featuring mathematical floating heart particles, typewriter love confessions, sparkle trails, and surprise messages.",
    inspiration: "Created especially for Mili with custom mathematical parametric heart equations, pulsating neon titles, heart burst explosions, and heartfelt typewriter notes: 'তুমি আমার সবচেয়ে সুন্দর স্বপ্ন 🌙'.",
    artworkImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop",
    category: "Python GUI & Generative Art",
    createdAt: "2025-02-14",
    tags: ["Python Tkinter", "Parametric Hearts", "Typewriter UI", "Heart Burst", "For Mili"],
    featured: true,
    canvasDrawingType: "love-app",
    pythonScript: `import tkinter as tk
import random
import math
import time

GF_NAME = "Mili"
YOUR_NAME = "Sukhen"

LOVE_MESSAGES = [
    f"তুমি আমার সবচেয়ে সুন্দর স্বপ্ন 🌙",
    f"তোমার হাসি দেখলে আমার পৃথিবী আলো হয়ে যায় ☀️",
    f"তুমি রাগলেও তুমি world's most cute person 🥺",
    f"I'm sorry... but I love you MORE than sorry! 💕",
    f"তোমাকে ছাড়া একটা দিনও ভাবতে পারি না 🫶",
    f"তোমার রাগ দেখতেও ভালো লাগে, তুমি জানো? 😄",
    f"আমি সবসময় তোমার পাশে আছি, ভালো-মন্দ সব সময়ে 💗",
    f"তুমি শুধু আমার GF না, তুমি আমার best friend ও 🌸",
    f"তোমার সাথে প্রতিটা মুহূর্ত special 💫",
    f"Smile koro please? Tumake khub miss korchi! 🙏💕",
]

SORRY_MESSAGES = [
    "Maaf koro amar sonaar meye 🥺",
    "Please smile koro na... 🌸",
    "Tumi rele ami kemon thakbo bolo? 💔",
    "Sorry sorry sorry... 1000 times! 🙏",
    "Tomar ragta dekhe moner khub kharap lage 😢",
]

class Heart:
    def __init__(self, canvas, x, y, size, color):
        self.canvas = canvas
        self.x = x
        self.y = y
        self.size = size
        self.color = color
        self.speed = random.uniform(1, 3)
        self.drift = random.uniform(-1.5, 1.5)
        self.opacity_step = random.uniform(0.01, 0.03)
        self.alpha = random.uniform(0.3, 1.0)
        self.id = self.draw()
        self.alive = True

    def draw(self):
        s = self.size
        pts = self.heart_points(self.x, self.y, s)
        return self.canvas.create_polygon(pts, fill=self.color, outline="", smooth=True)

    def heart_points(self, cx, cy, s):
        pts = []
        for i in range(0, 360, 5):
            t = math.radians(i)
            x = s * 16 * math.sin(t)**3
            y = -s * (13 * math.cos(t) - 5 * math.cos(2*t) - 2 * math.cos(3*t) - math.cos(4*t))
            pts.extend([cx + x, cy + y])
        return pts

    def move(self):
        self.y -= self.speed
        self.x += self.drift
        self.alpha -= self.opacity_step
        if self.alpha <= 0 or self.y < -50:
            self.canvas.delete(self.id)
            self.alive = False
        else:
            self.canvas.move(self.id, self.drift, -self.speed)

class LoveApp:
    def __init__(self, root):
        self.root = root
        self.root.title(f"💌 {GF_NAME} ke special feel karabo!")
        self.root.geometry("650x700")
        self.root.resizable(False, False)
        self.root.configure(bg="#1a0a1a")

        self.hearts = []
        self.msg_index = 0
        self.typing = False
        self.sorry_index = 0
        self.star_particles = []

        self.setup_ui()
        self.spawn_hearts()
        self.typewrite_next()
        self.animate()

    def setup_ui(self):
        # Top Canvas for floating hearts
        self.canvas = tk.Canvas(self.root, width=650, height=200,
                                bg="#1a0a1a", highlightthickness=0)
        self.canvas.pack()

        # Name label
        name_frame = tk.Frame(self.root, bg="#1a0a1a")
        name_frame.pack()

        tk.Label(name_frame, text="💌", font=("Arial", 30), bg="#1a0a1a").pack()
        self.name_label = tk.Label(
            name_frame,
            text=f"For My {GF_NAME} 💕",
            font=("Georgia", 26, "bold"),
            fg="#ff69b4",
            bg="#1a0a1a"
        )
        self.name_label.pack(pady=(0, 5))

        # Typewriter message box
        msg_frame = tk.Frame(self.root, bg="#2d0a2d", bd=0, relief="flat")
        msg_frame.pack(padx=30, pady=10, fill="x")

        self.msg_label = tk.Label(
            msg_frame,
            text="",
            font=("Georgia", 15),
            fg="#ffe4f0",
            bg="#2d0a2d",
            wraplength=560,
            justify="center",
            height=3
        )
        self.msg_label.pack(padx=20, pady=20)

        # Sparkle bar
        self.sparkle_canvas = tk.Canvas(self.root, width=650, height=30,
                                        bg="#1a0a1a", highlightthickness=0)
        self.sparkle_canvas.pack()
        self.draw_sparkles()

        # Sorry button
        self.sorry_btn = tk.Button(
            self.root,
            text="💝 Tap for a Surprise!",
            font=("Georgia", 14, "bold"),
            bg="#c2185b",
            fg="white",
            activebackground="#e91e8c",
            activeforeground="white",
            bd=0,
            padx=30,
            pady=12,
            cursor="heart",
            command=self.show_sorry,
            relief="flat"
        )
        self.sorry_btn.pack(pady=10)

        # Sorry message label
        self.sorry_label = tk.Label(
            self.root,
            text="",
            font=("Georgia", 13, "italic"),
            fg="#ffb3d9",
            bg="#1a0a1a",
            wraplength=560,
            justify="center"
        )
        self.sorry_label.pack(pady=5)

        # Heart burst button
        self.burst_btn = tk.Button(
            self.root,
            text="❤️ Heart Burst!",
            font=("Georgia", 12, "bold"),
            bg="#6a0032",
            fg="#ff9ec9",
            activebackground="#9c0050",
            activeforeground="white",
            bd=0,
            padx=20,
            pady=8,
            cursor="heart",
            command=self.burst_hearts,
            relief="flat"
        )
        self.burst_btn.pack(pady=5)

        # Bottom signature
        tk.Label(
            self.root,
            text=f"— With all my love, {YOUR_NAME} 🌸",
            font=("Georgia", 11, "italic"),
            fg="#9e5070",
            bg="#1a0a1a"
        ).pack(pady=(15, 5))

        self.pulse_name()

    def draw_sparkles(self):
        self.sparkle_canvas.delete("all")
        colors = ["#ff69b4", "#ffb3de", "#ff1493", "#ff85c0", "#ffc0cb"]
        for i in range(0, 650, 30):
            c = random.choice(colors)
            sym = random.choice(["✦", "✧", "⋆", "✨", "·"])
            self.sparkle_canvas.create_text(i, 15, text=sym, fill=c,
                                            font=("Arial", random.randint(8, 14)))

    def spawn_hearts(self):
        colors = ["#ff69b4", "#ff1493", "#ff85c0", "#ffb3d9", "#e91e8c",
                "#f48fb1", "#ff4d94", "#ff007f"]
        for _ in range(5):
            x = random.randint(30, 620)
            y = random.randint(50, 190)
            size = random.uniform(0.4, 1.2)
            color = random.choice(colors)
            self.hearts.append(Heart(self.canvas, x, y, size, color))

    def burst_hearts(self):
        colors = ["#ff69b4", "#ff1493", "#ff007f", "#e91e8c", "#ffb3d9"]
        for _ in range(20):
            x = random.randint(30, 620)
            y = random.randint(30, 180)
            size = random.uniform(0.5, 1.5)
            color = random.choice(colors)
            self.hearts.append(Heart(self.canvas, x, y, size, color))
        self.draw_sparkles()

    def animate(self):
        for h in self.hearts[:]:
            if h.alive:
                h.move()
            else:
                self.hearts.remove(h)

        if random.random() < 0.3:
            self.spawn_hearts()

        self.root.after(50, self.animate)

    def typewrite_next(self):
        msg = LOVE_MESSAGES[self.msg_index % len(LOVE_MESSAGES)]
        self.msg_label.config(text="")
        self.typing = True
        self._typewrite(msg, 0)

    def _typewrite(self, msg, i):
        if i <= len(msg):
            self.msg_label.config(text=msg[:i] + ("█" if i < len(msg) else ""))
            self.root.after(60, self._typewrite, msg, i + 1)
        else:
            self.msg_label.config(text=msg)
            self.typing = False
            self.msg_index += 1
            self.root.after(3500, self.typewrite_next)

    def show_sorry(self):
        msg = SORRY_MESSAGES[self.sorry_index % len(SORRY_MESSAGES)]
        self.sorry_label.config(text=msg)
        self.sorry_index += 1
        self.burst_hearts()
        self.sorry_btn.config(bg="#e91e8c")
        self.root.after(200, lambda: self.sorry_btn.config(bg="#c2185b"))

    def pulse_name(self):
        colors = ["#ff69b4", "#ff85c0", "#ff1493", "#ffb3d9", "#e91e8c"]
        c = random.choice(colors)
        self.name_label.config(fg=c)
        self.root.after(800, self.pulse_name)

if __name__ == "__main__":
    root = tk.Tk()
    app = LoveApp(root)
    root.mainloop()
`,
  },
  {
    id: "turtle-teddy-day",
    title: "Happy Teddy Day Mili (Cute Turtle Teddy & Confetti)",
    slug: "happy-teddy-day-turtle-teddy",
    description: "A custom Python Turtle script drawing a cute blushing teddy bear with blue ears, animated typewriter text, and 200 colorful confetti celebration bursts.",
    inspiration: "Created for Teddy Day — 'Happy teddy day my dear wife mili❤️ I love you❤️'. Drawn with precise geometric circles, blushing pink cheeks, typewriter text, and 200 vibrant celebration confetti particles.",
    artworkImage: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?q=80&w=1200&auto=format&fit=crop",
    category: "Python Turtle Character Art",
    createdAt: "2025-02-10",
    tags: ["Python Turtle", "Teddy Bear", "Teddy Day", "Confetti Burst", "For My Wife"],
    featured: true,
    canvasDrawingType: "teddy",
    pythonScript: `import turtle
import random
import time

screen = turtle.Screen()
screen.setup(width=1.0, height=1.0) 
screen.bgcolor("#DBE4BA") 
screen.title("Happy Teddy Day Mili! ❤️")

pen = turtle.Turtle()
pen.speed(2)

def ring(col, rad):
    pen.fillcolor(col)
    pen.begin_fill()
    pen.circle(rad)
    pen.end_fill()

# --- TEDDY POSITION ---
# Ears
pen.up(); pen.setpos(-105, 185); pen.down()
ring('blue', 45)
pen.up(); pen.setpos(105, 185); pen.down()
ring('blue', 45)

# Face 
pen.up(); pen.setpos(0, 5); pen.down()
ring('white', 120)

# Eyes
pen.up(); pen.setpos(-54, 125); pen.down()
ring('black', 24)
pen.up(); pen.setpos(54, 125); pen.down()
ring('black', 24)

# Eye highlights
pen.up(); pen.setpos(-54, 131); pen.down()
ring('white', 12)
pen.up(); pen.setpos(54, 131); pen.down()
ring('white', 12)

# Nose
pen.up(); pen.setpos(0, 65); pen.down()
ring('brown', 15)

# Mouth 
pen.up(); pen.setpos(0, 65); pen.down()
pen.right(90); pen.circle(15, 180)
pen.up(); pen.setpos(0, 65); pen.down()
pen.left(360); pen.circle(15, -180)

# Blush
pen.setheading(0)
pen.up(); pen.setpos(-80, 60); pen.down()
ring('#FFD1DC', 15)
pen.up(); pen.setpos(80, 60); pen.down()
ring('#FFD1DC', 15)

# --- SLOW TYPEWRITER MESSAGE 1 ---
message1 = "Happy teddy day my dear wife mili❤️"
pen.up()
pen.setpos(-450, -50)
pen.color("#000000")

for char in message1:
    pen.write(char, move=True, font=("Arial", 24, "bold italic"))
    time.sleep(0.1)

# --- NEW MESSAGE 2: I LOVE YOU ---
message2 = "I love you❤️"
pen.up()
pen.setpos(-450, -100) 
pen.color("#000000") 

for char in message2:
    pen.write(char, move=True, font=("Arial", 24, "bold italic"))
    time.sleep(0.1)

# --- FEATURE: TONS OF SPEEDY CONFETTI ---
pen.speed(0) 
confetti_colors = ['#FF69B4', '#FFD700', '#ADFF2F', '#00BFFF', '#FF4500', '#DA70D6']

for i in range(200): 
    x = random.randint(-600, 600)
    y = random.randint(-400, 500)
    color = random.choice(confetti_colors)
    
    pen.up()
    pen.setpos(x, y)
    pen.setheading(random.randint(0, 360))
    pen.down()
    pen.color(color)
    pen.pensize(random.randint(2, 5))
    
    distance = random.randint(15, 35)
    pen.forward(distance)

pen.hideturtle()
turtle.done()
`,
  },
  {
    id: "turtle-rose-day",
    title: "Happy Rose Day My Dear Mili (Turtle Red Rose & Heart)",
    slug: "happy-rose-day-turtle-red-rose",
    description: "A delicate Python Turtle script drawing a blooming crimson rose with green leaves, stem, and an encompassing glowing red heart outline.",
    inspiration: "Created for Rose Day — 'Happy rose day my dear mili.....!!!'. Handcrafted with complex curve geometry, filled red rose petals, green botanical leaves, and a grand bounding heart.",
    artworkImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
    category: "Botanical Generative Art",
    createdAt: "2025-02-07",
    tags: ["Python Turtle", "Rose Day", "Crimson Rose", "Green Leaves", "Glowing Heart"],
    featured: true,
    canvasDrawingType: "rose-day",
    pythonScript: `import turtle
screen = turtle.Screen()
screen.title("Pythontpoint")
screen.bgcolor("#DDD9D9") 

tur = turtle.Turtle()
tur.speed(10) 
tur.pensize(2)

tur.penup()
tur.goto(-250, -280) 
tur.color("#5d4037") 
tur.write("Happy rose day my dear mili.....!!!", align="left", font=("Verdana", 12, "italic"))

tur.goto(0, 0)
tur.penup()
tur.left(90)
tur.fd(200)
tur.pendown()
tur.right(90)

# Blooming Rose Petals
tur.fillcolor("#ff0000")
tur.begin_fill()
tur.circle(10, 180)
tur.circle(25, 110)
tur.left(50)
tur.circle(60, 45)
tur.circle(20, 170)
tur.right(24)
tur.fd(30)
tur.left(10)
tur.circle(30, 110)
tur.fd(20)
tur.left(40)
tur.circle(90, 70)
tur.circle(30, 150)
tur.right(30)
tur.fd(15)
tur.circle(80, 90)
tur.left(15)
tur.fd(45)
tur.right(165)
tur.fd(20)
tur.left(155)
tur.circle(150, 80)
tur.left(50)
tur.circle(150, 90)
tur.end_fill()

tur.left(150)
tur.circle(-90, 70)
tur.left(20)
tur.circle(75, 105)
tur.setheading(60)
tur.circle(80, 98)
tur.circle(-90, 40)

tur.left(180)
tur.circle(90, 40)
tur.circle(-80, 98)
tur.setheading(-83)

# First Leaf
tur.fd(30)
tur.left(90)
tur.fd(25)
tur.left(45)
tur.fillcolor("#4caf50")
tur.begin_fill()
tur.circle(-80, 90)
tur.right(90)
tur.circle(-80, 90)
tur.end_fill()

# Stem
tur.right(135)
tur.fd(60)
tur.left(180)
tur.fd(85)
tur.left(90)
tur.fd(80)

# Second Leaf
tur.right(90)
tur.right(45)
tur.fillcolor("#4caf50")
tur.begin_fill()
tur.circle(80, 90)
tur.left(90)
tur.circle(80, 90)
tur.end_fill()

# Stem Curve
tur.left(135)
tur.fd(60)
tur.left(180)
tur.fd(60)
tur.right(90)
tur.circle(226, 60)

# Heart Bounding Box
tur.pensize(4)
tur.color("#ff1744")
tur.left(50)
tur.forward(160)      
tur.circle(55, 200)   
tur.right(140)
tur.circle(55, 200)  
tur.forward(160)      

tur.hideturtle()
screen.mainloop()
`,
  },
  {
    id: "python-opencv-sketcher",
    title: "Hand Drawing Mili Portrait (OpenCV Contour Sketcher)",
    slug: "hand-drawing-mili-opencv-sketcher",
    description: "A Python OpenCV & NumPy computer vision engine that calculates edge contours from Mili's picture and simulates hand-drawn sketching stroke-by-stroke in real time.",
    inspiration: "Created to convert Mili's picture ('mili.svg') into a real-time realistic hand-drawn pencil portrait, rendering delicate curves point-by-point like an artist's pen.",
    artworkImage: "/images/mili_sketch.jpg",
    category: "Computer Vision & Generative Art",
    createdAt: "2025-02-20",
    tags: ["OpenCV (cv2)", "NumPy", "Contour Detection", "Pencil Sketch Simulation", "Hand Drawing"],
    featured: true,
    canvasDrawingType: "opencv-sketch",
    pythonScript: `import cv2
import numpy as np

IMAGE_PATH = "mili.svg"

img = cv2.imread(IMAGE_PATH)

if img is None:
    print("Image not found!")
    exit()

# Resize
target_width = 700
h, w = img.shape[:2]
ratio = target_width / w
img = cv2.resize(img, (target_width, int(h * ratio)))

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Binary image
_, thresh = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY_INV)

# Find contours
contours, _ = cv2.findContours(
    thresh,
    cv2.RETR_LIST,
    cv2.CHAIN_APPROX_NONE
)

# White canvas
canvas = np.ones_like(img) * 255

cv2.namedWindow("Hand Drawing", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Hand Drawing", 800, 800)

for contour in contours:
    pts = contour.reshape(-1, 2)

    if len(pts) < 5:
        continue

    for i in range(len(pts) - 1):
        x1, y1 = pts[i]
        x2, y2 = pts[i + 1]

        # Draw small stroke
        cv2.line(
            canvas,
            (x1, y1),
            (x2, y2),
            (0, 0, 0),
            1
        )

        cv2.imshow("Hand Drawing", canvas)

        key = cv2.waitKey(1)

        if key == 27:
            cv2.destroyAllWindows()
            exit()

cv2.waitKey(0)
cv2.destroyAllWindows()
`,
  },
  {
    id: "turtle-2",
    title: "Heartbeat Spiral Galaxy",
    slug: "heartbeat-spiral-galaxy",
    description: "A mathematical cardioid spiral generating hundreds of recursive heart loops radiating outward into a stardust cosmos.",
    inspiration: "Inspired by how my heart beats a little faster whenever you send me a message out of the blue.",
    artworkImage: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop",
    category: "Mathematical Cosmos",
    createdAt: "2024-07-28",
    tags: ["Turtle", "Cardioid Geometry", "Stardust", "Golden Ratio"],
    featured: true,
    canvasDrawingType: "heart",
    pythonScript: `import turtle
import colorsys

# Mili ❤️ My Galaxy
t = turtle.Turtle()
s = turtle.Screen()
s.bgcolor("#06040a")
t.speed(0)
t.pensize(2)

hue = 0.85
for i in range(300):
    color = colorsys.hsv_to_rgb(hue, 0.8, 1)
    t.pencolor(color)
    t.penup()
    t.goto(0, -50)
    t.pendown()
    t.forward(i * 1.4)
    t.left(144)
    t.circle(i * 0.4, 120)
    hue = (hue + 0.003) % 1.0

t.hideturtle()
turtle.done()
`,
  },
  {
    id: "turtle-3",
    title: "The Tree of Endless Memories",
    slug: "tree-of-endless-memories",
    description: "A recursive fractal tree branching into thousands of delicate glowing leaves, representing every memory we've shared.",
    inspiration: "Drawn to symbolize how our relationship started as a tiny seed and grew into a strong, beautiful sanctuary.",
    artworkImage: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1200&auto=format&fit=crop",
    category: "Fractal Geometry",
    createdAt: "2024-10-15",
    tags: ["Recursive Fractals", "Fractal Tree", "Glowing Canopy"],
    featured: true,
    canvasDrawingType: "tree",
    pythonScript: `import turtle

# Tree of Memories for Mili
t = turtle.Turtle()
s = turtle.Screen()
s.bgcolor("#07050d")
t.speed(0)
t.left(90)
t.up()
t.backward(150)
t.down()

def draw_tree(branch_len, pen_size):
    if branch_len > 6:
        t.pensize(pen_size)
        if branch_len < 20:
            t.pencolor("#fb7185") # Blossom leaf
        else:
            t.pencolor("#e2e8f0") # Trunk & branch
        t.forward(branch_len)
        t.right(22)
        draw_tree(branch_len - 12, max(1, pen_size * 0.7))
        t.left(44)
        draw_tree(branch_len - 12, max(1, pen_size * 0.7))
        t.right(22)
        t.backward(branch_len)

draw_tree(80, 7)
t.hideturtle()
turtle.done()
`,
  },
  {
    id: "turtle-4",
    title: "Golden Starlight Mandala",
    slug: "golden-starlight-mandala",
    description: "An intricate sacred mandala of interlocking geometric petals finished in warm champagne gold and starlight purple.",
    inspiration: "Created while listening to ambient lofi on a late study night, thinking about your bright eyes.",
    artworkImage: "https://images.unsplash.com/photo-1579208575657-c595a05383b7?q=80&w=1200&auto=format&fit=crop",
    category: "Sacred Geometry",
    createdAt: "2025-01-09",
    tags: ["Mandala", "Champagne Gold", "Symmetry"],
    featured: false,
    canvasDrawingType: "mandala",
    pythonScript: `import turtle

t = turtle.Turtle()
s = turtle.Screen()
s.bgcolor("#06040a")
t.speed(0)
t.width(1.5)

colors = ["#fde047", "#f59e0b", "#c084fc", "#f43f5e"]

for i in range(72):
    t.pencolor(colors[i % len(colors)])
    t.circle(120, 60)
    t.left(120)
    t.circle(120, 60)
    t.left(125)

t.hideturtle()
turtle.done()
`,
  }
];
