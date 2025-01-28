

random = (maxSize) => {
    return Math.random() * maxSize;
}

class Object {
  constructor(context, x, y, color, size, mass, vx = 0, vy = 0) {
      this.context = context;
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.size = size;
      this.mass = mass;
      this.life = true;
  }
  draw() {
    this.context.fillStyle = this.color;
    this.context.fillRect(this.x, this.y, this.size, this.size);
  }

  updatePosition(fx, fy){
      this.vx = (this.vx + fx) * 0.5;
      this.vy = (this.vy + fy) * 0.5;
      this.x += this.vx;
      this.y += this.vy;

      if(this.x <= 0 || this.x >= window.innerWidth){ this.vx *= -1; }
      if(this.y <= 0 || this.y >= window.innerHeight){ this.vy *= -1; }
  }
  static distance(obj1, obj2){
      return [obj1.x - obj2.x, obj1.y - obj2.y];
  }

}

class Cluster {
    constructor(context, number, color, size, mass){
        this.context = context;
        this.number = number;
        this.color = color;
        this.mass = mass;
        this.size = size;
        this.objects = [];
        for(let i = 0;i<number;i++){
            this.objects.push(new Object(context, random(window.innerWidth), random(window.innerHeight), color, size, mass));
        }
    }
    get length(){
        return this.number;
    }


}

rule = (cluster1, cluster2, g) => {
    for(let i=0;i<cluster1.length;i++){
        let fx = 0;
        let fy = 0;
        let obj1 = cluster1.objects[i];
        if(!obj1.life) continue;
        for(let j=0;j<cluster2.length;j++){
            let obj2 = cluster2.objects[j];
            if(obj1 === obj2 || !obj2.life) continue;

            let [dx, dy] = Object.distance(obj1, obj2);
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist > Math.max(obj1.size, obj2.size)/2){
                let F = g * obj1.mass * obj2.mass / dist;
                fx += (F * dx);
                fy += (F * dy);
            }
            else{
                if(obj1.mass > obj2.mass){
                    obj1.size += obj2.size ;
                    obj2.size = 0;
                    obj2.mass = 0;
                    obj2.life = false;
                }
                else{
                    obj2.size += obj1.size ;
                    obj1.size = 0;
                    obj1.mass = 0;
                    obj1.life = false;
                }
            }
        }
        obj1.updatePosition(fx, fy);

    }
}

(function() {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

  var cluster = new Cluster(context, random(20), 'rgba(0, 255, 255, 0.5)', 5, 1);
  var cluster2 = new Cluster(context, 20, 'rgba(255, 0, 0, 0.5)', 10, 1);


  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawStuff();
  }

  resizeCanvas();

  function drawStuff() {
      rule(cluster, cluster, -0.02);
      rule(cluster2, cluster2, 0.06);
      rule(cluster, cluster2, -0.04);
      rule(cluster2, cluster, -0.04);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);
      for(let i=0;i<cluster.length;i++){
          cluster.objects[i].draw();
      }
      for(let i=0;i<cluster2.length;i++){
          cluster2.objects[i].draw();
      }
      requestAnimationFrame(drawStuff);
  }
})();
