import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/sessions';
import { TurtleCreation } from '@/types';
import { APP_CONFIG } from '@/data/config';

// Gallery of templates for generator
const PYTHON_ART_TEMPLATES = [
  {
    type: 'mandala',
    keywords: ['mandala', 'circle', 'flower', 'petal', 'bloom', 'sacred', 'geometric'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    category: 'Mathematical Geometry',
    scriptGenerator: (title: string) => `import turtle
import math

screen = turtle.Screen()
screen.bgcolor("#080512")
screen.title("${title}")

t = turtle.Turtle()
t.speed(0)
t.pensize(2)

colors = ["#f43f5e", "#fb7185", "#fda4af", "#ec4899", "#d946ef", "#a855f7"]

for i in range(180):
    t.pencolor(colors[i % len(colors)])
    t.forward(i * 1.5)
    t.left(59)
    t.circle(i * 0.4, 60)

t.penup()
t.goto(0, -220)
t.pencolor("#ffffff")
t.write("Drawn with endless love for Mili ❤️", align="center", font=("Arial", 14, "italic"))
t.hideturtle()
turtle.done()`,
  },
  {
    type: 'heart',
    keywords: ['heart', 'love', 'valentines', 'romantic', 'passion', 'forever'],
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop',
    category: 'Romantic Parametric Art',
    scriptGenerator: (title: string) => `import turtle
import math

screen = turtle.Screen()
screen.bgcolor("#0a0612")
screen.title("${title}")

t = turtle.Turtle()
t.speed(0)
t.color("#f43f5e")

def heart_x(k):
    return 15 * (math.sin(k) ** 3)

def heart_y(k):
    return 12 * math.cos(k) - 5 * math.cos(2*k) - 2 * math.cos(3*k) - math.cos(4*k)

t.penup()
for i in range(6000):
    k = i * 0.1
    x = heart_x(k) * 16
    y = heart_y(k) * 16
    t.goto(x, y)
    t.pendown()
    t.pencolor("#f43f5e" if i % 2 == 0 else "#fb7185")

t.penup()
t.goto(0, -240)
t.pencolor("#ffffff")
t.write("You are my whole universe, Sharmili 💕", align="center", font=("Arial", 16, "bold"))
t.hideturtle()
turtle.done()`,
  },
  {
    type: 'rose',
    keywords: ['rose', 'lotus', 'tulip', 'garden', 'flora', 'crimson'],
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    category: 'Botanical Generative Art',
    scriptGenerator: (title: string) => `import turtle

screen = turtle.Screen()
screen.bgcolor("#06040a")
screen.title("${title}")

t = turtle.Turtle()
t.speed(0)
t.pensize(2)

# Blooming crimson petals
colors = ["#e11d48", "#be123c", "#f43f5e", "#fda4af"]
for i in range(120):
    t.pencolor(colors[i % len(colors)])
    t.circle(190 - i, 90)
    t.left(90)
    t.circle(190 - i, 90)
    t.left(18)

# Stem & leaves
t.pencolor("#10b981")
t.right(90)
t.forward(200)

t.penup()
t.goto(0, -250)
t.pencolor("#ffffff")
t.write("A flower that never fades for my wife Mili 🌹", align="center", font=("Arial", 14, "italic"))
t.hideturtle()
turtle.done()`,
  },
  {
    type: 'galaxy',
    keywords: ['galaxy', 'cosmos', 'star', 'space', 'universe', 'starlight', 'spiral', 'astronomy'],
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop',
    category: 'Cosmic Generative Art',
    scriptGenerator: (title: string) => `import turtle
import math

screen = turtle.Screen()
screen.bgcolor("#020108")
screen.title("${title}")

t = turtle.Turtle()
t.speed(0)

colors = ["#38bdf8", "#818cf8", "#c084fc", "#f472b6", "#fb7185"]

for i in range(250):
    t.pencolor(colors[i % len(colors)])
    t.pensize(i / 60 + 1)
    t.forward(i * 1.6)
    t.left(71)
    t.circle(i * 0.3, 45)

t.penup()
t.goto(0, -240)
t.pencolor("#e0e7ff")
t.write("Among billions of stars, I found you 🌌❤️", align="center", font=("Arial", 15, "bold"))
t.hideturtle()
turtle.done()`,
  },
  {
    type: 'tree',
    keywords: ['tree', 'nature', 'branches', 'sakura', 'cherry', 'forest', 'life'],
    image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=1200&auto=format&fit=crop',
    category: 'Fractal Nature Art',
    scriptGenerator: (title: string) => `import turtle

screen = turtle.Screen()
screen.bgcolor("#07050d")
screen.title("${title}")

t = turtle.Turtle()
t.speed(0)
t.left(90)
t.up()
t.backward(180)
t.down()

def fractal_tree(branch_len, t):
    if branch_len > 5:
        if branch_len < 20:
            t.color("#f472b6")  # Pink blossoms
            t.pensize(2)
        else:
            t.color("#854d0e")  # Wood trunk
            t.pensize(branch_len / 10 + 1)
            
        t.forward(branch_len)
        t.right(25)
        fractal_tree(branch_len - 12, t)
        t.left(50)
        fractal_tree(branch_len - 12, t)
        t.right(25)
        t.backward(branch_len)

fractal_tree(85, t)

t.penup()
t.goto(0, -240)
t.pencolor("#fbcfe8")
t.write("Our love growing stronger with every branch 🌸", align="center", font=("Arial", 14, "italic"))
t.hideturtle()
turtle.done()`,
  },
];

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    const adminToken = request.headers.get('x-admin-token');
    const isAdmin =
      session?.userRole === 'sukhen' ||
      session?.userRole === 'mili' ||
      adminToken === APP_CONFIG.adminPasscode ||
      adminToken === 'das@123' ||
      adminToken === 'mili@123' ||
      adminToken === 'mili';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only Admins (Sukhen & Mili) can auto-generate Python Art.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const prompt = (body.prompt || '').trim();
    const rawCode = (body.code || '').trim();

    if (!prompt && !rawCode) {
      return NextResponse.json(
        { error: 'Please enter a description/prompt or paste your Python code.' },
        { status: 400 }
      );
    }

    let detectedTemplate = PYTHON_ART_TEMPLATES[0];
    const combinedText = `${prompt} ${rawCode}`.toLowerCase();

    for (const tmpl of PYTHON_ART_TEMPLATES) {
      if (tmpl.keywords.some((k) => combinedText.includes(k))) {
        detectedTemplate = tmpl;
        break;
      }
    }

    // Title generation
    let title = prompt;
    if (!title && rawCode) {
      const match = rawCode.match(/title\(["']([^"']+)["']\)/i);
      title = match ? match[1] : 'Custom Python Turtle Sketch';
    }
    if (!title) {
      title = 'Mathematical Flower for Mili';
    }
    // Clean up title
    title = title.replace(/^["']|["']$/g, '');
    if (!title.toLowerCase().includes('mili') && !title.toLowerCase().includes('turtle')) {
      title = `${title} (Python Turtle Art)`;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `turtle-${Date.now()}`;

    const pythonScript = rawCode ? rawCode : detectedTemplate.scriptGenerator(title);

    const description = `A mathematical Python Turtle script generating complex parametric geometry, colorful gradient strokes, and smooth animations crafted for Sharmili.`;
    const inspiration = `Created with recursive mathematics and algorithms to express endless love for Mili: 'Every pixel and calculation here was designed to bring a warm smile to your face.'`;

    const creation: TurtleCreation = {
      id: `turtle-${Date.now()}`,
      title,
      slug,
      description,
      artworkImage: detectedTemplate.image,
      pythonScript,
      category: detectedTemplate.category,
      inspiration,
      tags: ['Python Turtle', 'Generative Art', 'Mathematical Curves', 'For My Wife'],
      featured: true,
      canvasDrawingType: detectedTemplate.type as any,
      createdAt: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({
      success: true,
      creation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to generate Python Art' },
      { status: 500 }
    );
  }
}
