class FloatingWindow {
  constructor(title, label, initial) {
    this.title = title;
    this.label = label;
    this.initial = initial;
    this.minWidth = 182;
    this.minHeight = 95;

    var windowElement = document.createElement('div');
    document.body.appendChild(windowElement);
    this.windowElement = windowElement;
    windowElement.style = `
      width: 300px;
      height: 100px;
      background-color: #2E2E2E;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: absolute;
      top: 50px;
      left: 50%;
      z-index: 1000;
      border-radius: 6px;
    `;


    var header = document.createElement('div');
    windowElement.appendChild(header);
    header.style = `
      background-color: #3C3C3C;
      width: 100%;
      height: 22px;
      position: absolute;
      left: 0px;
      top: 0px;
      border-left: 1px solid #646464;
      border-top: 1px solid #858585;
      border-right: 1px solid #646464;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      box-sizing: border-box;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    var closeButton = document.createElement('div');
    header.appendChild(closeButton);
    closeButton.style = `
      width: 12px;
      height: 12px;
      border-radius: 6px;
      position: absolute;
      left: 7px;
      top: 4px;
      background-color: #FF564E;
    `;

    closeButton.onclick = () => this.removeWindow();
    closeButton.onpointerdown = (e) => e.stopPropagation();

    var titleElement = document.createElement('h2');
    header.appendChild(titleElement);
    titleElement.innerText = this.title;
    titleElement.style = `
      margin: 0;
      font-size: 16px;
      flex-grow: 1;
      text-align: center;
      font: 14px Roboto;
    `;


    var div = document.createElement('div');
    windowElement.appendChild(div);
    div.style = `
      width: 100%;
      height: 1px;
      border-left: 1px solid #333333;
      border-right: 1px solid #333333;
      background-color: #000000;
      position: absolute;
      left: 0px;
      top: 22px;
      box-sizing: border-box;
    `;

    var body = document.createElement('div');
    windowElement.appendChild(body);
    body.style = `
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 100%;
      height: calc(100% - 22px);
      border-left: 1px solid #4B4B4B;
      border-bottom: 1px solid #565656;
      border-right: 1px solid #565656;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
      box-sizing: border-box;
    `;

    var labelElement = document.createElement('label');
    body.appendChild(labelElement);
    labelElement.setAttribute('for', 'textInput');
    labelElement.innerText = this.label;
    labelElement.style = `
      color: white;
      font: 14px Roboto;
      position: absolute;
      top: 17px;
      left: 10px;
    `;

    var labelWidth = labelElement.offsetWidth;

    var inputElement = document.createElement('input');
    this.inputElement = inputElement;
    body.appendChild(inputElement);
    inputElement.type = 'text';
    inputElement.value = this.initial;
    inputElement.style = `
      position: absolute;
      top: 15px;
      right: 10px;
      width: calc(100% - ${labelWidth + 30}px);
      background-color: #383838;
      color: white;
      border-top: 1px solid #444444;
      border-bottom: 1px solid #4F4F4F;
      border-left: 1px solid #3F3F3F;
      border-right: 1px solid #3F3F3F;
      height: 20px;
      outline: none;
    `;

    inputElement.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.submit(inputElement.value);
        this.removeWindow();
      }
    });

    var buttonContainer = document.createElement('div');
    body.appendChild(buttonContainer);
    buttonContainer.style = 'text-align: right;';

    var cancelButton = document.createElement('button');
    buttonContainer.appendChild(cancelButton);
    cancelButton.innerText = 'Cancel';
    cancelButton.style = `
      width: 70px;
      height: 21px;
      position: absolute;
      bottom: 8px;
      right: 96px;
      border: 1px solid #242424;
      box-sizing: border-box;
      color: white;
      background-color: #626262;
      border-radius: 4px;
    `;
    cancelButton.onclick = () => this.removeWindow();

    var okButton = document.createElement('button');
    buttonContainer.appendChild(okButton);
    okButton.innerText = 'OK';
    okButton.style = `
      width: 70px;
      height: 21px;
      position: absolute;
      bottom: 8px;
      right: 14px;
      border: 1px solid #242424;
      box-sizing: border-box;
      color: white;
      background-color: #626262;
      border-radius: 4px;
    `;
    okButton.onclick = () => {
      this.submit(inputElement.value);
      this.removeWindow();
    }





    let offsetX = 0, offsetY = 0;

    header.onpointerdown = (e) => {
      e.preventDefault();
      offsetX = e.clientX - this.windowElement.offsetLeft;
      offsetY = e.clientY - this.windowElement.offsetTop;

      header.setPointerCapture(e.pointerId);

      header.onpointermove = (e) => {
        e.preventDefault();
        this.windowElement.style.left = `${e.clientX - offsetX}px`;
        this.windowElement.style.top = `${e.clientY - offsetY}px`;
      };

      header.onpointerup = (e) => {
        header.releasePointerCapture(e.pointerId);
        header.onpointermove = null;
        header.onpointerup = null;
      };
    };


// Resizing logic
const createResizer = (direction) => {
  const resizer = document.createElement('div');
  resizer.classList.add('resizer', direction);
  this.windowElement.appendChild(resizer);

  // Adjust cursor and position based on the direction
  let cursor, styles = {};
  if (direction === 'top') {
    cursor = 'n-resize';
    styles = { top: '0', left: '0', right: '0', height: '5px' };
  } else if (direction === 'bottom') {
    cursor = 's-resize';
    styles = { bottom: '0', left: '0', right: '0', height: '5px' };
  } else if (direction === 'left') {
    cursor = 'w-resize';
    styles = { top: '0', left: '0', bottom: '0', width: '5px' };
  } else if (direction === 'right') {
    cursor = 'e-resize';
    styles = { top: '0', right: '0', bottom: '0', width: '5px' };
  } else if (direction === 'top-right') {
    cursor = 'ne-resize';
    styles = { top: '0', right: '0', width: '10px', height: '10px' };
  } else if (direction === 'top-left') {
    cursor = 'nw-resize';
    styles = { top: '0', left: '0', width: '10px', height: '10px' };
  } else if (direction === 'bottom-right') {
    cursor = 'se-resize';
    styles = { bottom: '0', right: '0', width: '10px', height: '10px' };
  } else if (direction === 'bottom-left') {
    cursor = 'sw-resize';
    styles = { bottom: '0', left: '0', width: '10px', height: '10px' };
  }

  Object.assign(resizer.style, {
    position: 'absolute',
    backgroundColor: 'transparent',
    cursor: cursor,
    zIndex: '1001',
    ...styles,
  });

  resizer.onpointerdown = (e) => {
    e.preventDefault();

    const originalWidth = parseFloat(getComputedStyle(this.windowElement, null).getPropertyValue('width').replace('px', ''));
    const originalHeight = parseFloat(getComputedStyle(this.windowElement, null).getPropertyValue('height').replace('px', ''));
    const originalX = e.pageX;
    const originalY = e.pageY;
    const originalLeft = this.windowElement.offsetLeft;
    const originalTop = this.windowElement.offsetTop;

    const onPointerMove = (e) => {
      if (direction.includes('right')) {
        const width = max(this.minWidth, originalWidth + (e.pageX - originalX));
        this.windowElement.style.width = `${width}px`;
      }
      if (direction.includes('bottom')) {
        const height = max(this.minHeight, originalHeight + (e.pageY - originalY));
        this.windowElement.style.height = `${height}px`;
      }
      if (direction.includes('left')) {
        const width = max(this.minWidth, originalWidth - (e.pageX - originalX));
        if (width > this.minWidth) {
          this.windowElement.style.width = `${width}px`;
          this.windowElement.style.left = `${originalLeft + (e.pageX - originalX)}px`;
        }
      }
      if (direction.includes('top')) {
        const height = max(this.minHeight, originalHeight - (e.pageY - originalY));
        if (height > this.minHeight) {
          this.windowElement.style.height = `${height}px`;
          this.windowElement.style.top = `${originalTop + (e.pageY - originalY)}px`;
        }
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };
};

// Add resizers for all edges and corners
createResizer('top');
createResizer('bottom');
createResizer('left');
createResizer('right');
createResizer('top-right');
createResizer('top-left');
createResizer('bottom-right');
createResizer('bottom-left');


    inputElement.focus();
  }

  submit(value) {

  }

  removeWindow() {
    document.body.removeChild(this.windowElement);
  }
}

class FloatingTextSaveWindow {
  constructor(title, bodyText) {
    this.title = title;
    this.bodyText = bodyText;
    this.minWidth = 300;
    this.minHeight = 150;

    var windowElement = document.createElement('div');
    document.body.appendChild(windowElement);
    this.windowElement = windowElement;
    windowElement.style = `
      width: 400px;
      height: 200px;
      background-color: #2E2E2E;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: absolute;
      top: 50px;
      left: 50%;
      z-index: 1000;
      border-radius: 6px;
    `;

    var header = document.createElement('div');
    windowElement.appendChild(header);
    header.style = `
      background-color: #3C3C3C;
      width: 100%;
      height: 22px;
      position: absolute;
      left: 0px;
      top: 0px;
      border-left: 1px solid #646464;
      border-top: 1px solid #858585;
      border-right: 1px solid #646464;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      box-sizing: border-box;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    var closeButton = document.createElement('div');
    header.appendChild(closeButton);
    closeButton.style = `
      width: 12px;
      height: 12px;
      border-radius: 6px;
      position: absolute;
      left: 7px;
      top: 4px;
      background-color: #FF564E;
    `;
    closeButton.onclick = () => this.removeWindow();
    closeButton.onpointerdown = (e) => e.stopPropagation();

    var titleElement = document.createElement('h2');
    header.appendChild(titleElement);
    titleElement.innerText = this.title;
    titleElement.style = `
      margin: 0;
      font-size: 16px;
      flex-grow: 1;
      text-align: center;
      font: 14px Roboto;
    `;

    var body = document.createElement('div');
    windowElement.appendChild(body);
    body.style = `
      position: absolute;
      top: 23px;
      left: 0px;
      width: 100%;
      height: calc(100% - 70px);
      padding: 10px;
      box-sizing: border-box;
      color: white;
      font: 14px Roboto;
      overflow: hidden;
    `;
    body.innerText = this.bodyText;

    var buttonContainer = document.createElement('div');
    windowElement.appendChild(buttonContainer);
    buttonContainer.style = `
      position: absolute;
      bottom: 8px;
      left: 0;
      width: 100%;
      text-align: right;
      padding-right: 14px;
    `;

    ['Cancel', 'Don\'t Save', 'Save'].forEach((action) => {
      var button = document.createElement('button');
      buttonContainer.appendChild(button);
      button.innerText = action;
      button.style = `
        margin-left: 5px;
        width: 80px;
        height: 25px;
        border: 1px solid #242424;
        box-sizing: border-box;
        color: white;
        background-color: #626262;
        border-radius: 4px;
      `;
      button.onclick = () => this.handleAction(action);
    });

    let offsetX = 0, offsetY = 0;
    header.onpointerdown = (e) => {
      e.preventDefault();
      offsetX = e.clientX - this.windowElement.offsetLeft;
      offsetY = e.clientY - this.windowElement.offsetTop;

      header.setPointerCapture(e.pointerId);
      header.onpointermove = (e) => {
        e.preventDefault();
        this.windowElement.style.left = `${e.clientX - offsetX}px`;
        this.windowElement.style.top = `${e.clientY - offsetY}px`;
      };
      header.onpointerup = (e) => {
        header.releasePointerCapture(e.pointerId);
        header.onpointermove = null;
        header.onpointerup = null;
      };
    };

    const createResizer = (direction) => {
      const resizer = document.createElement('div');
      resizer.classList.add('resizer', direction);
      this.windowElement.appendChild(resizer);

      let cursor, styles = {};
      if (direction === 'top') {
        cursor = 'n-resize';
        styles = { top: '0', left: '0', right: '0', height: '5px' };
      } else if (direction === 'bottom') {
        cursor = 's-resize';
        styles = { bottom: '0', left: '0', right: '0', height: '5px' };
      } else if (direction === 'left') {
        cursor = 'w-resize';
        styles = { top: '0', left: '0', bottom: '0', width: '5px' };
      } else if (direction === 'right') {
        cursor = 'e-resize';
        styles = { top: '0', right: '0', bottom: '0', width: '5px' };
      } else if (direction === 'top-right') {
        cursor = 'ne-resize';
        styles = { top: '0', right: '0', width: '10px', height: '10px' };
      } else if (direction === 'top-left') {
        cursor = 'nw-resize';
        styles = { top: '0', left: '0', width: '10px', height: '10px' };
      } else if (direction === 'bottom-right') {
        cursor = 'se-resize';
        styles = { bottom: '0', right: '0', width: '10px', height: '10px' };
      } else if (direction === 'bottom-left') {
        cursor = 'sw-resize';
        styles = { bottom: '0', left: '0', width: '10px', height: '10px' };
      }

      Object.assign(resizer.style, {
        position: 'absolute',
        backgroundColor: 'transparent',
        cursor: cursor,
        zIndex: '1001',
        ...styles,
      });

      resizer.onpointerdown = (e) => {
        e.preventDefault();

        const originalWidth = parseFloat(getComputedStyle(this.windowElement, null).getPropertyValue('width').replace('px', ''));
        const originalHeight = parseFloat(getComputedStyle(this.windowElement, null).getPropertyValue('height').replace('px', ''));
        const originalX = e.pageX;
        const originalY = e.pageY;
        const originalLeft = this.windowElement.offsetLeft;
        const originalTop = this.windowElement.offsetTop;

        const onPointerMove = (e) => {
          if (direction.includes('right')) {
            const width = Math.max(this.minWidth, originalWidth + (e.pageX - originalX));
            this.windowElement.style.width = `${width}px`;
          }
          if (direction.includes('bottom')) {
            const height = Math.max(this.minHeight, originalHeight + (e.pageY - originalY));
            this.windowElement.style.height = `${height}px`;
          }
          if (direction.includes('left')) {
            const width = Math.max(this.minWidth, originalWidth - (e.pageX - originalX));
            if (width > this.minWidth) {
              this.windowElement.style.width = `${width}px`;
              this.windowElement.style.left = `${originalLeft + (e.pageX - originalX)}px`;
            }
          }
          if (direction.includes('top')) {
            const height = Math.max(this.minHeight, originalHeight - (e.pageY - originalY));
            if (height > this.minHeight) {
              this.windowElement.style.height = `${height}px`;
              this.windowElement.style.top = `${originalTop + (e.pageY - originalY)}px`;
            }
          }
        };

        const onPointerUp = () => {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
      };
    };

    createResizer('top');
    createResizer('bottom');
    createResizer('left');
    createResizer('right');
    createResizer('top-right');
    createResizer('top-left');
    createResizer('bottom-right');
    createResizer('bottom-left');
  }

  handleAction(action) {
    if (action === 'Cancel') {
      this.cancel();
    } else if (action === 'Don\'t Save') {
      this.dontSave();
    } else if (action === 'Save') {
      this.save();
    }
  }

  cancel() {
    this.removeWindow();
  }
  save() {
    this.removeWindow();
  }
  dontSave() {
    this.removeWindow();
  }

  removeWindow() {
    document.body.removeChild(this.windowElement);
  }
}


class FloatingTextArea {
  constructor(title, initial) {
    this.title = title;
    this.initial = initial;
    this.minWidth = 182;
    this.minHeight = 95;

    var windowElement = document.createElement('div');
    document.body.appendChild(windowElement);
    this.windowElement = windowElement;
    windowElement.style = `
      width: 800px;
      height: 800px;
      background-color: #2E2E2E;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: absolute;
      top: 50px;
      left: 20%;
      z-index: 1000;
      border-radius: 6px;
    `;


    var header = document.createElement('div');
    windowElement.appendChild(header);
    header.style = `
      background-color: #3C3C3C;
      width: 100%;
      height: 22px;
      position: absolute;
      left: 0px;
      top: 0px;
      border-left: 1px solid #646464;
      border-top: 1px solid #858585;
      border-right: 1px solid #646464;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      box-sizing: border-box;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    var closeButton = document.createElement('div');
    header.appendChild(closeButton);
    closeButton.style = `
      width: 12px;
      height: 12px;
      border-radius: 6px;
      position: absolute;
      left: 7px;
      top: 4px;
      background-color: #FF564E;
    `;

    closeButton.onclick = () => this.removeWindow();
    closeButton.onpointerdown = (e) => e.stopPropagation();

    var titleElement = document.createElement('h2');
    header.appendChild(titleElement);
    titleElement.innerText = this.title;
    titleElement.style = `
      margin: 0;
      font-size: 16px;
      flex-grow: 1;
      text-align: center;
      font: 14px Roboto;
    `;


    var div = document.createElement('div');
    windowElement.appendChild(div);
    div.style = `
      width: 100%;
      height: 1px;
      border-left: 1px solid #333333;
      border-right: 1px solid #333333;
      background-color: #000000;
      position: absolute;
      left: 0px;
      top: 22px;
      box-sizing: border-box;
    `;

    var body = document.createElement('div');
    windowElement.appendChild(body);
    body.style = `
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 100%;
      height: calc(100% - 22px);
      border-left: 1px solid #4B4B4B;
      border-bottom: 1px solid #565656;
      border-right: 1px solid #565656;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
      box-sizing: border-box;
    `;

    var area = document.createElement('textarea');
    body.appendChild(area);

    area.style = `
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      outline: none;
      border: none;
      color: white;
      font: 14px monospace;
      background-color: #1E1E1E;
      resize: none;
    `;

    area.value = initial;


    enableTabToIndent(area);
/*
    new ResizeObserver(entries => {
      windowElement.style.width = `calc(${area.style.width} + 2px)`;
      windowElement.style.height = `calc(${area.style.height} + 24px)`;
    }).observe(area);
*/
    area.onkeydown = function(event) {
      event.stopPropagation();
    }

    var buttonContainer = document.createElement('div');
    body.appendChild(buttonContainer);
    buttonContainer.style = 'text-align: right;';

    var cancelButton = document.createElement('button');
    buttonContainer.appendChild(cancelButton);
    cancelButton.innerText = 'Cancel';
    cancelButton.style = `
      width: 70px;
      height: 21px;
      position: absolute;
      bottom: 8px;
      right: 96px;
      border: 1px solid #242424;
      box-sizing: border-box;
      color: white;
      background-color: #626262;
      border-radius: 4px;
    `;
    cancelButton.onclick = () => this.removeWindow();

    var okButton = document.createElement('button');
    buttonContainer.appendChild(okButton);
    okButton.innerText = 'OK';
    okButton.style = `
      width: 70px;
      height: 21px;
      position: absolute;
      bottom: 8px;
      right: 14px;
      border: 1px solid #242424;
      box-sizing: border-box;
      color: white;
      background-color: #626262;
      border-radius: 4px;
    `;
    okButton.onclick = () => {
      this.submit(area.value);
      this.removeWindow();
    }





    let offsetX = 0, offsetY = 0;

    header.onpointerdown = (e) => {
      e.preventDefault();
      offsetX = e.clientX - this.windowElement.offsetLeft;
      offsetY = e.clientY - this.windowElement.offsetTop;

      header.setPointerCapture(e.pointerId);

      header.onpointermove = (e) => {
        e.preventDefault();
        this.windowElement.style.left = `${e.clientX - offsetX}px`;
        this.windowElement.style.top = `${e.clientY - offsetY}px`;
      };

      header.onpointerup = (e) => {
        header.releasePointerCapture(e.pointerId);
        header.onpointermove = null;
        header.onpointerup = null;
      };
    };



// Resizing logic
const createResizer = (direction) => {
  const resizer = document.createElement('div');
  resizer.classList.add('resizer', direction);
  this.windowElement.appendChild(resizer);

  // Adjust cursor and position based on the direction
  let cursor, styles = {};
  if (direction === 'top') {
    cursor = 'n-resize';
    styles = { top: '0', left: '0', right: '0', height: '5px' };
  } else if (direction === 'bottom') {
    cursor = 's-resize';
    styles = { bottom: '0', left: '0', right: '0', height: '5px' };
  } else if (direction === 'left') {
    cursor = 'w-resize';
    styles = { top: '0', left: '0', bottom: '0', width: '5px' };
  } else if (direction === 'right') {
    cursor = 'e-resize';
    styles = { top: '0', right: '0', bottom: '0', width: '5px' };
  } else if (direction === 'top-right') {
    cursor = 'ne-resize';
    styles = { top: '0', right: '0', width: '10px', height: '10px' };
  } else if (direction === 'top-left') {
    cursor = 'nw-resize';
    styles = { top: '0', left: '0', width: '10px', height: '10px' };
  } else if (direction === 'bottom-right') {
    cursor = 'se-resize';
    styles = { bottom: '0', right: '0', width: '10px', height: '10px' };
  } else if (direction === 'bottom-left') {
    cursor = 'sw-resize';
    styles = { bottom: '0', left: '0', width: '10px', height: '10px' };
  }

  Object.assign(resizer.style, {
    position: 'absolute',
    backgroundColor: 'transparent',
    cursor: cursor,
    zIndex: '1001',
    ...styles,
  });

  resizer.onpointerdown = (e) => {
    e.preventDefault();

    const originalWidth = parseFloat(getComputedStyle(this.windowElement, null).getPropertyValue('width').replace('px', ''));
    const originalHeight = parseFloat(getComputedStyle(this.windowElement, null).getPropertyValue('height').replace('px', ''));
    const originalX = e.pageX;
    const originalY = e.pageY;
    const originalLeft = this.windowElement.offsetLeft;
    const originalTop = this.windowElement.offsetTop;

    const onPointerMove = (e) => {
      if (direction.includes('right')) {
        const width = max(this.minWidth, originalWidth + (e.pageX - originalX));
        this.windowElement.style.width = `${width}px`;
      }
      if (direction.includes('bottom')) {
        const height = max(this.minHeight, originalHeight + (e.pageY - originalY));
        this.windowElement.style.height = `${height}px`;
      }
      if (direction.includes('left')) {
        const width = max(this.minWidth, originalWidth - (e.pageX - originalX));
        if (width > this.minWidth) {
          this.windowElement.style.width = `${width}px`;
          this.windowElement.style.left = `${originalLeft + (e.pageX - originalX)}px`;
        }
      }
      if (direction.includes('top')) {
        const height = max(this.minHeight, originalHeight - (e.pageY - originalY));
        if (height > this.minHeight) {
          this.windowElement.style.height = `${height}px`;
          this.windowElement.style.top = `${originalTop + (e.pageY - originalY)}px`;
        }
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };
};

// Add resizers for all edges and corners
createResizer('top');
createResizer('bottom');
createResizer('left');
createResizer('right');
createResizer('top-right');
createResizer('top-left');
createResizer('bottom-right');
createResizer('bottom-left');


    area.focus();
  }

  submit(value) {

  }

  removeWindow() {
    document.body.removeChild(this.windowElement);
  }
}



class FloatingItemListWindow {
  constructor(title, items) {
    this.title = title;
    this.items = items;
    this.minWidth = 300;
    this.minHeight = 200;

    var windowElement = document.createElement('div');
    document.body.appendChild(windowElement);
    this.windowElement = windowElement;
    windowElement.style = `
      width: 400px;
      height: 300px;
      background-color: #2E2E2E;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: absolute;
      top: 50px;
      left: 50%;
      z-index: 1000;
      border-radius: 6px;
    `;

    var header = document.createElement('div');
    windowElement.appendChild(header);
    header.style = `
      background-color: #3C3C3C;
      width: 100%;
      height: 22px;
      position: absolute;
      left: 0px;
      top: 0px;
      border-left: 1px solid #646464;
      border-top: 1px solid #858585;
      border-right: 1px solid #646464;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      box-sizing: border-box;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    var closeButton = document.createElement('div');
    header.appendChild(closeButton);
    closeButton.style = `
      width: 12px;
      height: 12px;
      border-radius: 6px;
      position: absolute;
      left: 7px;
      top: 4px;
      background-color: #FF564E;
    `;
    closeButton.onclick = () => this.removeWindow();
    closeButton.onpointerdown = (e) => e.stopPropagation();

    var titleElement = document.createElement('h2');
    header.appendChild(titleElement);
    titleElement.innerText = this.title;
    titleElement.style = `
      margin: 0;
      font-size: 16px;
      flex-grow: 1;
      text-align: center;
      font: 14px Roboto;
    `;

    var div = document.createElement('div');
    windowElement.appendChild(div);
    div.style = `
      width: 100%;
      height: 1px;
      border-left: 1px solid #333333;
      border-right: 1px solid #333333;
      background-color: #000000;
      position: absolute;
      left: 0px;
      top: 22px;
      box-sizing: border-box;
    `;

    var body = document.createElement('div');
    windowElement.appendChild(body);
    body.style = `
      position: absolute;
      top: 23px;
      left: 0px;
      width: 100%;
      height: calc(100% - 70px);
      border-left: 1px solid #4B4B4B;
      border-bottom: 1px solid #565656;
      border-right: 1px solid #565656;
      box-sizing: border-box;
      overflow-y: hidden;
    `;

    var itemElements = [];
    this.itemElements = itemElements;


    var scroll = 0;
    var sh = 26 * this.items.length;
    var oh = body.offsetHeight - 1;
    var sf = sh / oh;
    var sbh = oh / sf;
    var ms = sh - oh;
    var msb = oh - sbh;

    this.initItemElements = function() {
      itemElements.forEach(e => e.remove());
      itemElements.length = 0;
      this.items.forEach((item, index) => {
        var itemElement = document.createElement('div');
        itemElements.push(itemElement);
        body.appendChild(itemElement);
        itemElement.innerText = item;
        itemElement.style = `
          color: white;
          cursor: pointer;
          font: 14px Roboto;
          width: 100%;
          display: flex;
          align-items: center;
          text-indent: 10px;
          height: 26px;
          position: absolute;
        `;
        itemElement.style.top = 26*index-scroll*ms + 'px';
        itemElement.onclick = () => this.selectItem(index);
      });
    }

    this.initItemElements();

    function scrollItems(offy) {
      itemElements.forEach((ie,i) => {
        ie.style.top = (26*i - offy) + 'px';
      });
    }

    var track = document.createElement('div');
    body.appendChild(track);
    track.style = `
      background-color: #2B2B2B;
      border-left: 1px solid #3E3E3E;
      position: absolute;
      top: 0px;
      right: 0px;
      height: 100%;
      width: 14px;
      box-sizing: border-box;
      z-index: 1;
    `;

    var thumbwrapper = document.createElement('div');
    track.appendChild(thumbwrapper);
    thumbwrapper.style = `
      width: 13px;
      right: 0px;
      position: absolute;
      top: 0px;
    `;


    this.scrollTo = function(s) {
      sroll = s;
    }
    this.getScroll = function() {
      return scroll;
    }


    thumbwrapper.style.height = sbh + 'px';

    var scrollCalc = () => {
      sh = 26 * this.items.length;
      oh = body.offsetHeight - 1;
      sf = sh / oh;
      sbh = oh / sf;
      ms = sh - oh;
      msb = oh - sbh;
      thumbwrapper.style.height = sbh + 'px';
      thumbwrapper.style.top = scroll*msb + 'px';
      if (ms > 0) {
        track.removeAttribute('hidden');
      } else {
        track.setAttribute('hidden',true);
      }
    }

    this.scrollCalc = scrollCalc;

    if (ms > 0) {
      track.removeAttribute('hidden');
    } else {
      track.setAttribute('hidden',true);
    }

    var thumb = document.createElement('div');
    thumbwrapper.appendChild(thumb);
    thumb.style = `
      width: 10px;
      height: calc(100% - 4px);
      background-color: #6B6B6B;
      border: 1px solid #232323;
      border-radius: 5px;
      position: absolute;
      top: 2px;
      left: 2px;
      box-sizing: border-box;
    `;

    thumbwrapper.onpointerdown = function(event) {
      event.stopPropagation();
      this.setPointerCapture(event.pointerId);
      var iy = this.offsetTop;
      var imy = event.y;
      this.onpointermove = function(event) {
        var ny = iy + event.y - imy;
        ny = clamp(0, ny, msb);
        this.style.top = ny + 'px';
        scroll = ny / msb;
        scrollItems(scroll * ms);
      }
      this.onpointerup = function(event) {
        this.releasePointerCapture(event.pointerId);
        this.onpointermove = null;
        this.onpointerup = null;
      }
    }



    var buttonContainer = document.createElement('div');
    windowElement.appendChild(buttonContainer);
    buttonContainer.style = `
      position: absolute;
      bottom: 8px;
      left: 0;
      width: 100%;
      text-align: right;
      padding-right: 14px;
    `;

    ['Delete', 'Duplicate', 'Rename', 'Open'].forEach((action) => {
      var button = document.createElement('button');
      buttonContainer.appendChild(button);
      button.innerText = action;
      button.style = `
        margin-left: 5px;
        width: 80px;
        height: 25px;
        border: 1px solid #242424;
        box-sizing: border-box;
        color: white;
        background-color: #626262;
        border-radius: 4px;
      `;
      button.onclick = () => this.handleAction(action);
    });

    let offsetX = 0, offsetY = 0;
    header.onpointerdown = (e) => {
      e.preventDefault();
      offsetX = e.clientX - this.windowElement.offsetLeft;
      offsetY = e.clientY - this.windowElement.offsetTop;

      header.setPointerCapture(e.pointerId);
      header.onpointermove = (e) => {
        e.preventDefault();
        this.windowElement.style.left = `${e.clientX - offsetX}px`;
        this.windowElement.style.top = `${e.clientY - offsetY}px`;
      };
      header.onpointerup = (e) => {
        header.releasePointerCapture(e.pointerId);
        header.onpointermove = null;
        header.onpointerup = null;
      };
    };

    this.selectedItemIndex = null;

    // Resizing logic
    const createResizer = (direction) => {
      const resizer = document.createElement('div');
      resizer.classList.add('resizer', direction);
      this.windowElement.appendChild(resizer);

      let cursor, styles = {};
      if (direction === 'top') {
        cursor = 'n-resize';
        styles = { top: '-2.5', left: '0', right: '0', height: '5px' };
      } else if (direction === 'bottom') {
        cursor = 's-resize';
        styles = { bottom: '-2.5', left: '0', right: '0', height: '5px' };
      } else if (direction === 'left') {
        cursor = 'w-resize';
        styles = { top: '0', left: '-2.5', bottom: '0', width: '5px' };
      } else if (direction === 'right') {
        cursor = 'e-resize';
        styles = { top: '0', right: '-2.5', bottom: '0', width: '5px' };
      } else if (direction === 'top-right') {
        cursor = 'ne-resize';
        styles = { top: '-5', right: '-5', width: '10px', height: '10px' };
      } else if (direction === 'top-left') {
        cursor = 'nw-resize';
        styles = { top: '-5', left: '-5', width: '10px', height: '10px' };
      } else if (direction === 'bottom-right') {
        cursor = 'se-resize';
        styles = { bottom: '-5', right: '-5', width: '10px', height: '10px' };
      } else if (direction === 'bottom-left') {
        cursor = 'sw-resize';
        styles = { bottom: '-5', left: '-5', width: '10px', height: '10px' };
      }

      Object.assign(resizer.style, {
        position: 'absolute',
        backgroundColor: 'transparent',
        cursor: cursor,
        zIndex: '1001',
        ...styles,
      });

      resizer.onpointerdown = (e) => {
        e.preventDefault();

        const originalWidth = parseFloat(getComputedStyle(this.windowElement, null).getPropertyValue('width').replace('px', ''));
        const originalHeight = parseFloat(getComputedStyle(this.windowElement, null).getPropertyValue('height').replace('px', ''));
        const originalX = e.pageX;
        const originalY = e.pageY;
        const originalLeft = this.windowElement.offsetLeft;
        const originalTop = this.windowElement.offsetTop;

        const onPointerMove = (e) => {
          if (direction.includes('right')) {
            const width = Math.max(this.minWidth, originalWidth + (e.pageX - originalX));
            this.windowElement.style.width = `${width}px`;
          }
          if (direction.includes('bottom')) {
            const height = Math.max(this.minHeight, originalHeight + (e.pageY - originalY));
            this.windowElement.style.height = `${height}px`;
          }
          if (direction.includes('left')) {
            const width = Math.max(this.minWidth, originalWidth - (e.pageX - originalX));
            if (width > this.minWidth) {
              this.windowElement.style.width = `${width}px`;
              this.windowElement.style.left = `${originalLeft + (e.pageX - originalX)}px`;
            }
          }
          if (direction.includes('top')) {
            const height = Math.max(this.minHeight, originalHeight - (e.pageY - originalY));
            if (height > this.minHeight) {
              this.windowElement.style.height = `${height}px`;
              this.windowElement.style.top = `${originalTop + (e.pageY - originalY)}px`;
            }
          }
          if (direction.includes('top') || direction.includes('bottom')) {
            scrollCalc();
          }
        };

        const onPointerUp = () => {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
      };
    };

    // Add resizers for all edges and corners
    createResizer('top');
    createResizer('bottom');
    createResizer('left');
    createResizer('right');
    createResizer('top-right');
    createResizer('top-left');
    createResizer('bottom-right');
    createResizer('bottom-left');
  }

  selectItem(index) {
    if (this.selectedItemIndex !== null) {
      this.itemElements[this.selectedItemIndex].style.backgroundColor = '';
    }
    this.selectedItemIndex = index;
    this.itemElements[index].style.backgroundColor = '#444';
  }

  handleAction(action) {
    if (this.selectedItemIndex === null) return;
    var selectedItem = this.items[this.selectedItemIndex];
    if (action === 'Delete') {
      if (!saves) saves = JSON.parse(decompress(localStorage.getItem('saves')));
      delete saves[this.items[this.selectedItemIndex]];
      localStorage.setItem('saves',compress(JSON.stringify(saves)));
      this.items.splice(this.selectedItemIndex, 1);
      this.initItemElements();
      this.scrollCalc();
      var index = this.selectedItemIndex;
      this.selectedItemIndex = null;
      this.selectItem(index-1);
    } else if (action === 'Duplicate') {
      if (!saves) saves = JSON.parse(decompress(localStorage.getItem('saves')));
      var name = this.items[this.selectedItemIndex];
      var newname = name;
      function nextnewname(name) {
        return name.match(/copy \d+$/) ? name.replace(/(\d+)$/, function(match) { return parseInt(match) + 1; }) : name.match(/copy$/) ? name + ' 2' : name + ' copy';
      }
      do {
        newname = nextnewname(newname);
      } while (newname in saves)
      saves[newname] = saves[name];
      localStorage.setItem('saves',compress(JSON.stringify(saves)));
      this.items.splice(this.selectedItemIndex + 1, 0, newname);
      this.initItemElements();
      this.scrollCalc();
      var index = this.selectedItemIndex;
      this.selectedItemIndex = null;
      this.selectItem(index+1);
    } else if (action === 'Rename') {
      if (!saves) saves = JSON.parse(decompress(localStorage.getItem('saves')));
      var name = this.items[this.selectedItemIndex];
      var w = new FloatingWindow('Rename ' + name,'Name: ', name);
      w.submit = newname => {
        if (newname in saves) {
          alert('name already taken');
          return;
        }
        saves[newname] = saves[name];
        delete saves[name];
        this.items[this.selectedItemIndex] = newname;
        localStorage.setItem('saves',compress(JSON.stringify(saves)));
        this.initItemElements();
      }
    } else if (action === 'Open') {
      var name = this.items[this.selectedItemIndex];
      load(name);
      this.removeWindow();
    }
  }

  removeWindow() {
    document.body.removeChild(this.windowElement);
  }
}