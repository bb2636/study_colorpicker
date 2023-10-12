const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
ctx = canvas.getContext("2d");

// 기본값 있는 전역 변수
let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#000";

const setCanvasBackground = () => {
    // 전체 배경은 흰색으로 설정 다운받은 img배경이 흰색이 되도록 함
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; 
}

window.addEventListener("load", () => {
    // 캔버스 너비,높이 설정
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

const drawRect = (e) => {
    // 채우기 미선택시 테두리 그리기
    //아니면 채워서 그리기
    if(!fillColor.checked) {
        // 마우스 포인터 따라 그리기
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}

const drawCircle = (e) => {
    ctx.beginPath(); // 원 그릴 새 경로
    // 마우스 포인터 따라 원의 반지름 가져오기
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI); 
    fillColor.checked ? ctx.fill() : ctx.stroke(); 
    // 채우기 선택 시 원을 채우고 아니면 테두리만 그리기
}

const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY); // 마우스 포인터 따라 삼각형 이동
    ctx.lineTo(e.offsetX, e.offsetY); // 마우스 포인터 따라 첫번째 줄 만들기
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); // 삼각형 밑변 만들기
    ctx.closePath(); // 마지막 선이 자동으로 그려짐
    fillColor.checked ? ctx.fill() : ctx.stroke(); //채우기 선택 시 채운 삼각형 아니면 테두리만
}

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX; // 현재 마우스x좌표를 prevMouseX값으로 전달
    prevMouseY = e.offsetY; // 현재 마우스y좌표를 prevMouseY값으로 전달
    ctx.beginPath();
    ctx.lineWidth = brushWidth; // 브러쉬 사이즈를 너비로 지정
    ctx.strokeStyle = selectedColor; // 선택한 색을 stroke스타일로 전달
    ctx.fillStyle = selectedColor; // 선택한 색을 채우기 스타일로 전달
    // 캔버스 데이터 복사 > 이미지 드래깅 방지
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

const drawing = (e) => {
    if(!isDrawing) return; //isDrawing 이 false일 경우 
    ctx.putImageData(snapshot, 0, 0); // 복사된 캔버스 데이터를 이 캔버스에 추가

    if(selectedTool === "brush" || selectedTool === "eraser") {
        // 지우개 선택 시 흰색으로 칠하기
        // 기존 캔버스 내용에 흰색으로 칠하려면 stroke색을 선택한 색으로 설정
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY); // 마우스 포인터 따라 선 만들기
        ctx.stroke(); // 색으로 줄을 그리거나 채우기
    } else if(selectedTool === "rectangle"){
        drawRect(e);
    } else if(selectedTool === "circle"){
        drawCircle(e);
    } else {
        drawTriangle(e);
    }
}

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => { //모든 도구 옵션에 이벤트 삽입
        // 이전 옵션에서 활성 클래스 제거 및 현재 클릭된 옵션 추가
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value); // 슬라이더 값을 붓 사이즈로 전달

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => { // 모든 색상에 클릭 이벤트
        //이전 옵션에서 선택한 클래스 제거 및 현재 클릭한 옵션 추가
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        //선택한 버튼 배경색을 선택한 색 값으로 전달
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    //색상 선택기에서 마지막으로 고른 색상값 전달
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //캔버스 전체 지우기
    setCanvasBackground();
});

saveImg.addEventListener("click", () => {
    const link = document.createElement("a"); // <a>태그 생성
    link.download = `${Date.now()}.jpg`; // 현재 날짜를 링크 다운로드 값으로 전달
    link.href = canvas.toDataURL(); // 캔버스 데이터를 링크 주소값으로 전달
    link.click(); // 이미지 다운로드 클릭
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);