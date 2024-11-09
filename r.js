

var toolbar = document.createElement('div');
document.body.appendChild(toolbar);
toolbar.style = `
  width: 100%;
  height: 24px;
  border-bottom: 4px solid #1E1E1E;
  box-sizing: border-box;
  position: absolute;
  left: 0px;
  top: 0px;
  display: flex;
`;

file = document.createElement('div');
toolbar.appendChild(file);
file.innerText = 'File';

edit = document.createElement('div');
toolbar.appendChild(edit);
edit.innerText = 'Edit';

file.style = edit.style = `
  color: white;
  font: 16px Roboto;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 10px;
  border-right: 2px solid #1E1E1E;
  box-sizing: border-box;
  user-select: none;
  cursor: pointer;
`;

file.onclick = function() {
  createFileContextMenu(this.offsetLeft, this.offsetTop + this.offsetHeight);
}

edit.onclick = function() {
  createEditContextMenu(this.offsetLeft, this.offsetTop + this.offsetHeight);
}