'use strict';

/****************************************/
/* Carousel Class */
/****************************************/
class Carousel {
  constructor(el) 
  {
    // Store the root element and the basic carousel setup.
    this.el = el;
    this.carouselOptions = ['previous', 'add', 'play', 'next'];
    this.carouselData = [
      {
        'id': '1',
        'src': 'http://fakeimg.pl/300/?text=1',
      },
      {
        'id': '2',
        'src': 'http://fakeimg.pl/300/?text=2',
      },
      {
        'id': '3',
        'src': 'http://fakeimg.pl/300/?text=3',
      },
      {
        'id': '4',
        'src': 'http://fakeimg.pl/300/?text=4',
      },
      {
        'id': '5',
        'src': 'http://fakeimg.pl/300/?text=5',
      }
    ];
    this.carouselInView = [1, 2, 3, 4, 5];
    this.carouselContainer;
    this.carouselPlayState;
  }

  mounted() 
  {
    this.setupCarousel();
  }

/****************************************/
/* Build Carousel */
/****************************************/
  setupCarousel() 
  {
    const container = document.createElement('div');
    const controls = document.createElement('div');

    // Add the main parts of the carousel to the page.
    this.el.append(container, controls);
    container.className = 'carousel-container';
    controls.className = 'carousel-controls';
    this.carouselData.forEach((item, index) => 
    {
      const carouselItem = item.src ? document.createElement('img') : document.createElement('div');

      container.append(carouselItem);
      
      // Give each item its position class and image source.
      carouselItem.className = `carousel-item carousel-item-${index + 1}`;
      carouselItem.src = item.src;
      carouselItem.setAttribute('loading', 'lazy');
      carouselItem.setAttribute('data-index', `${index + 1}`);
    });

    this.carouselOptions.forEach((option) => 
    {
      const btn = document.createElement('button');
      const axSpan = document.createElement('span');

      axSpan.innerText = option;
      axSpan.className = 'ax-hidden';
      btn.append(axSpan);

      btn.className = `carousel-control carousel-control-${option}`;
      btn.setAttribute('data-name', option);

      controls.append(btn);
    });

    this.setControls([...controls.children]);

    this.carouselContainer = container;
  }

/****************************************/
/* Control Buttons */
/****************************************/
  setControls(controls) 
  {
    controls.forEach(control => 
    {
      control.onclick = (event) => 
      {
        event.preventDefault();

        this.controlManager(control.dataset.name);
      };
    });
  }

  controlManager(control) 
  {
    if (control === 'previous') return this.previous();
    if (control === 'next') return this.next();
    if (control === 'add') return this.add();
    if (control === 'play') return this.play();

    return;
  }

/****************************************/
/* Move Items */
/****************************************/
  previous() 
  {
    this.carouselData.unshift(this.carouselData.pop());

    this.carouselInView.push(this.carouselInView.shift());

    this.carouselInView.forEach((item, index) => 
    {
      this.carouselContainer.children[index].className = `carousel-item carousel-item-${item}`;
    });

    this.carouselData.slice(0, 5).forEach((data, index) => 
    {
      document.querySelector(`.carousel-item-${index + 1}`).src = data.src;
    });
  }

  next() 
  {
    this.carouselData.push(this.carouselData.shift());

    this.carouselInView.unshift(this.carouselInView.pop());

    this.carouselInView.forEach((item, index) => {
      this.carouselContainer.children[index].className = `carousel-item carousel-item-${item}`;
    });

    this.carouselData.slice(0, 5).forEach((data, index) => {
      document.querySelector(`.carousel-item-${index + 1}`).src = data.src;
    });
  }

/****************************************/
/* Add New Item */
/****************************************/
  add() {
    const newItem = {
      'id': '',
      'src': '',
    };
    const lastItem = this.carouselData.length;
    const lastIndex = this.carouselData.findIndex(item => item.id == lastItem);
    
    Object.assign(newItem, {
      id: `${lastItem + 1}`,
      src: `http://fakeimg.pl/300/?text=${lastItem + 1}`
    });

    this.carouselData.splice(lastIndex + 1, 0, newItem);

    this.next();
  }

/****************************************/
/* Auto Play */
/****************************************/
  play() {
    const playBtn = document.querySelector('.carousel-control-play');
    const startPlaying = () => this.next();

    if (playBtn.classList.contains('playing')) {
      playBtn.classList.remove('playing');

      clearInterval(this.carouselPlayState); 
      this.carouselPlayState = null; 
    } 
    else {
      playBtn.classList.add('playing');

      this.next();

      this.carouselPlayState = setInterval(startPlaying, 1500);
    };
  }

}

/****************************************/
/* Start Carousel */
/****************************************/
const el = document.querySelector('.carousel');
const exampleCarousel = new Carousel(el);
exampleCarousel.mounted();
