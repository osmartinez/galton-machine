const board = document.getElementById('galton-board')


function generateRandomInteger(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1))
}

const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

class Circle {
    constructor(radius) {
        this.x = 0
        this.y = 0
        this.radius = radius
    }

    touches(circle) {
        const d = distance(circle.x, circle.y, this.x, this.y)
        return d <= circle.radius + this.radius ||
            d <= circle.radius + this.radius ||
            d <= this.radius + circle.radius
    }

}

class Ball extends Circle {
    constructor(name, speed, radius, boardHeight, collisionCallback) {
        super(radius)
        this.stopped = false
        this.riseForce = 0.5
        this.fallForce = 1
        this.acceleration = 0.005
        this.accelerationDecreaseRatio = 0.00001
        this.mode = 'fall'
        this.collideAngle = 0
        this.collideSpeed = 0.2
        this.collisionCallback = collisionCallback
        this.speed = speed
        this.name = name
        this.x = generateRandomInteger(330, 420)
        this.y = 0
        this.boardHeight = boardHeight
        this.element = document.createElement('div')
        this.element.className = 'circle ball'
        this.element.style.width = `${radius*2}px`
        this.element.style.height = `${radius*2}px`
        this.element.style.top = `${this.y}px`
        this.element.style.left = `${this.x}px`
        board.appendChild(this.element)
        this.move()
    }

    updateAcceleration() {
        if (this.acceleration < 0) {
            this.acceleration = 0
        }
        else {
            this.acceleration += this.accelerationDecreaseRatio
        }
    }

    move() {
        this.thread = setInterval(() => {

            if (this.mode === 'fall') {
                this.y += this.speed * this.fallForce
                this.fallForce += this.acceleration
            }
            else if (this.mode === 'rise') {
                this.y -= this.speed * this.riseForce
                this.riseForce -= this.acceleration
                this.updateAcceleration()
                if (this.riseForce <= 0) {
                    this.mode = 'fall'
                    this.riseForce = 0.5
                    this.fallForce = 0
                }
            }

            if (this.collideAngle !== 0) {
                this.x += this.collideAngle * (this.speed * this.collideSpeed)
            }

            this.element.style.top = `${this.y}px`
            this.element.style.left = `${this.x}px`

            this.collisionCallback(this)
            if (this.y >= this.boardHeight) {
                this.stop()
            }
        }, 1)
    }

    collide() {
        console.log('colliding')
        this.collideAngle = Math.random() < 0.5 ? -1 : +1
        this.mode = 'rise'
    }

    stop() {
        this.stopped = true
        clearInterval(this.thread)
    }
}

class Wall extends Circle {
    constructor(x, y, radius) {
        super(radius)
        this.x = x
        this.y = y
        this.element = document.createElement('div')
        this.element.className = 'circle wall'
        this.element.style.width = `${radius*2}px`
        this.element.style.height = `${radius*2}px`
        this.element.style.top = `${this.y}px`
        this.element.style.left = `${this.x}px`
        
        board.appendChild(this.element)
    }
}

class Pyramid {
    constructor(floorSize, wallRadius) {
        this.walls = []
        let wallSize = floorSize
        const initX = 90
        let x = initX
        let y = 600
        let jumpX = 50
        let jumpY = 40
        for (let k = 0; k < Math.ceil(floorSize); k++) {
            for (let i = 0; i < wallSize; i++) {
                this.walls.push(new Wall(x, y, wallRadius))
                x += jumpX
            }
            y -= jumpY
            x = initX + ((k + 1) * (jumpX / 2))
            wallSize -= 1
        }
    }
}


class GaltonMachine {
    constructor(totalBallCount,ballRadius,wallRadius,boardWidth,boardHeight,pyramidBaseWidth) {
        this.boardConfig(boardWidth,boardHeight)
        this.ballSpeed = 1
        this.generatedBalls = 0
        this.pyramid = new Pyramid(pyramidBaseWidth, wallRadius)
        this.balls = []
        const ballGen = setInterval(() => {
            this.balls.push(new Ball(`${this.generatedBalls}`, this.ballSpeed, ballRadius,boardHeight, this.collisionControl))
            this.generatedBalls++
            if (this.generatedBalls >= totalBallCount) {
                clearInterval(ballGen)
            }
        }, 50)
    }

    boardConfig(boardWidth,boardHeight){
        board.style.width= `${boardWidth}px`
        board.style.height= `${boardHeight}px`
    }

    collisionControl = (ball) => {
        for (const wall of this.pyramid.walls) {
            if (ball.touches(wall)) {
                ball.collide()
            }
        }

        for (const stoppedBall of this.balls.filter(b=>b.stopped)){
            if(ball.touches(stoppedBall)){
                ball.stop()
            }
        }
    }
}


new GaltonMachine(
    totalBallCount=500
    ,ballRadius=6
    ,wallRadius=6
    ,boardWidth=800
    ,boardHeight=1500
    ,pyramidBaseWidth=13)




