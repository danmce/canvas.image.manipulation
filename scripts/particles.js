function draw() {
    var i, n, t;
    for (ctx.clearRect(0, 0, W, H), i = 0; i < particles.length; i++) n = particles[i], ctx.beginPath(), n.angle = n.angle += Math.PI / 60, t = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius), t.addColorStop(0, "rgba(" + n.color + ", 1)"), t.addColorStop(.3, "rgba(" + n.color + ", " + n.opacity + ")"), t.addColorStop(1, "rgba(" + n.color + ", 0)"), ctx.fillStyle = t, ctx.arc(n.x, n.y, n.circumference, Math.PI * 2, !1), ctx.fill(), n.x = n.x + n.path * Math.cos(n.angle), n.y = n.y + n.path * Math.sin(n.angle), n.x < -50 && (n.x = W + 50), n.y < -50 && (n.y = H + 50), n.x > W + 50 && (n.x = -50), n.y > H + 50 && (n.y = -50)
}
var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.globalCompositeOperation = "destination-atop";
var W = 500,
    H = 500,
    particle = function(n, t, i, r, u, f, g, e, o, s) {
        this.x = n;
        this.y = t;
        this.vx = i;
        this.vy = r;
        this.angle = u;
        this.color = f;
        this.opacity = g;
        this.radius = e;
        this.circumference = o;
        this.path = s
    },
    particles = [];
particles.push(new particle(100, 50, 0, 0, 0, "255,20,147", "0.8", 260, 290, 1));
particles.push(new particle(250, 250, 0, 0, 2, "255,255,0", "1", 140, 170, 0.5));
particles.push(new particle(150, 150, 0, 0, 6, "255,0,255", "1", 170, 190, 0.8));
particles.push(new particle(150, 300, 0, 0, 8, "0,255,0", "1", 170, 190, 0.8));
setInterval(draw,33)