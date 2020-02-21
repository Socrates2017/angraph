/****************************可配置项******************************/
//webgl 在canvas中y轴起点，图区距离浏览器上边缘的距离
var viewportY =40;
//Y轴标签距离浏览器左边距离，图区距离浏览器左边缘的距离
var lableSpaceL =25;
//行名称标签距离浏览器右边距离，图区距离浏览器右边缘的距离
var lableSpaceR =10;
//行标签颜色块大小
var rowColorLableWidth=30;
//行标签颜色块大小
var rowColorLableHeight=16;
//x轴与浏览器下方的距离，留出空间放置按钮
var bottomSpace=100;  
//y轴刻度数量
var yNum=10;
//默认字体，行名称、列名称、坐标标签字体
var defaultFont = "18px 黑体";
//标题字体
var titleFont = "24px 黑体";
//点击显示坐标值字体
var clickFont = "14px 黑体";
//表格内边距
var paddingForCell = 10;


/*****************以上变量都是可配置变量，以下变量不可配置，随意赋予默认值将可能导致不可预测的错误***********************/
//webgl 在canvas中x轴起点
var viewportX =0;
//y轴标签左边距，用以辅助计算
var lableSpaceL2 =0;
//坐标轴右方空白，留出空间放置各行数据的说明
var rowsNameSpace=0;
//坐标轴下方空白，留出空间放置各行数据的说明
var columnsNameSpace=25;
//图表类型
var graphType="line";
//展示状态
var showStatus={
	//是否转置
	isTrans:false,
	//是否求和
	isSum:false,
	//是否求和
	isAvg:false
};

//原始数据
var data={
		title:"",//图表标题
		rows:[],//数据行，二维数组
		rowsName:[],//行名称，数组
		columnsName:[],//列名称，数组
		sumRow:[],//总和值行,数字数组
		avgRow:[]//平均值行，数字数组
}
//转置后的数据
var transData={
		title:"",//图表标题
		rows:[],//数据行，二维数组
		rowsName:[],//行名称，数组
		columnsName:[],//列名称，数组
		sumRow:[],//总和值行,数字数组
		avgRow:[]//平均值行，数字数组
}
//当前展示的数据
var currentData={
		title:"",//图表标题
		rows:[],//数据行，二维数组
		rowsName:[],//行名称，数组
		columnsName:[],//列名称，数组
		yMax:0,//最大的数值，未范式化
		yCoordinateMax:0,//y轴 坐标的最大值，整数
		yLabels:[],//y轴坐标的标签数组,整数数组
		sumRow:[],//总和值行,数字数组
		avgRow:[],//平均值行，数字数组
		colors:[],//每行数据显示颜色，1值表示
		color255:[]//每行数据显示颜色，255值表示
}

//附加文字、坐标的画板
var backgroundCanvas= document.getElementById('backgroundCanvas');
var textCanvas= document.getElementById('text');
var glCanvas = document.getElementById('webgl');
var canvasDiv = document.getElementById('canvasDiv');
//颜色标签在canvas上的起点坐标值格式为：[x1,y1,x2,y2....]
var colorLabels=[]
//保存每一行是否被点击的状态，初始默认都为0，即没点击，点击后改为1
var rowColorLableClick=[];

/*************************全局变量结束*************************/

/**
 * 窗口高度改变时触发
 */
window.onresize = function () {
	show();
}
/**
 * 页面加载完毕后触发
 */
window.onload=function(){ 
	
//	var uri = window.location.pathname;
//    var jobId = uri.substr(5);	
//	doPost(jobId);
	
	test();

}




/**
 * mock测试
 * @returns
 */
function test(){
	//测试数据
	//select name as rowName, col1,clo2,col3 from table limit 10;
	var result ={};
	result.data={
			"title":"现金贷全流程人数图",
			"rowsName":["注册人数","授信人数","提现人数","还款人数"],
			"rows":[[9222,9888,7888,5000,4562,7854,4598,8888,7777,6666,7458,5654],
				    [9000,9121,7451,4562,3565,6525,2254,5685,6854,5687,7000,5000],
			        [5240,7451,4565,4525,3025,6013,1021,4120,6520,4526,7000,4523],
			        [5012,4520,3201,2012,2012,3652,201,4023,2013,3201,2314,3564]],
			"columnsName":["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
	}
	
	process(result.data)
	
}

/**
 * 网络请求
 * @param jobId
 * @returns
 */
function doPost(jobId){
    var dataObj = {};
    dataObj.jobId = jobId;
    $.ajax({
        url: "/graph/job",
        type: "POST",
        cache: false,
        contentType: "application/json;charset=utf-8",
        datatype: "json",
        data: JSON.stringify(dataObj),
        success: function (result) {
            if (result.code == 10000) {
                
            	process(result.data);
            } else {
               
            	console.log('Request Fail!');
            }
        }
    });
}

/**
 * 请求后端数据
 * @param result
 * @returns
 */
function process(resultData){
	data=resultData;
	
	//如果行名称缺失，则采取默认值
	if(data.rowsName==undefined){
		var rowsName=[];		
		for(let i=0;i<data.rows.length;i++){
			rowsName.push(i+1);
		}
		data.rowsName=rowsName;
	}
		
	
	//初始化转置数据
	if(!transData.isInited){
		transData=transposeData(data);
	}
	
	//求出总数和平均数行
	var dataSumRow=getSumRow(data);
	var dataAvgRow =getAvgRow(dataSumRow,data.rows.length);
	data.sumRow=dataSumRow;
	data.avgRow=dataAvgRow;
	
	var transDataSumRow = getSumRow(transData);
	var transDataAvgRow =getAvgRow(transDataSumRow,transData.rows.length);
	transData.sumRow=transDataSumRow;
	transData.avgRow=transDataAvgRow;
	
	show();
}

/**
 * 转置按钮点击事件
 * @returns
 */
function trans(){
	if(showStatus.isTrans){
		showStatus.isTrans=false;
	}else{
		showStatus.isTrans=true;
	}
	show()
}

/**
 * 图表切换事件
 * @returns
 */
function changeGraphType(){
	var myselect=document.getElementById("graphType");
	var index=myselect.selectedIndex ;
	graphType = myselect.options[index].value;
	show();
}


/**
 * 求和按钮点击事件
 * @returns
 */
function sum(){	
	if(showStatus.isSum){
		showStatus.isSum=false;
		var sumButton=document.getElementById("sum");
		sumButton.innerHTML="增加总和";		
	}else{
		showStatus.isSum=true;
		var sumButton=document.getElementById("sum");
		sumButton.innerHTML="去除总和";
	}
	show();
}

/**
 * 求和按钮点击事件
 * @returns
 */
function avg(){	
	if(showStatus.isAvg){
		showStatus.isAvg=false;
		var sumButton=document.getElementById("avg");
		sumButton.innerHTML="增加平均";		
	}else{
		showStatus.isAvg=true;
		var sumButton=document.getElementById("avg");
		sumButton.innerHTML="去除平均";
	}
	
	show();
}


/**
 * 展示数据
 * @returns
 */
function show() {	
	changeCanvas();
	
	if(showStatus.isTrans){	
		currentData= deepClone(transData);
	}else{
		currentData= deepClone(data);
	}	
	
	if(showStatus.isSum){	
		addRow2CurrentData(currentData.sumRow,"总和")
	}
	
	if(showStatus.isAvg){	
		addRow2CurrentData(currentData.avgRow,"平均")
	}
	
	initeData(currentData)
	
	draw(currentData);
}




/**
 * 初始化数据
 * @param data
 * @returns
 */
function initeData(data){
	
	for(var i=0;i<data.rows.length;i++){
		rowColorLableClick[i]=0;
	}
	
	//获得数据中的最大值
	var yMax = largerstOfArr(data.rows)
	data.yMax=yMax;
	//范式化为单元整数
	data.yCoordinateMax=normalizeMax(yMax);
	
	
	var yLabels = getyLabels(data.yCoordinateMax,yNum)
	data.yLabels=yLabels;
	
	//计算viewportX
	//最长的y轴标签，也即最后一个标签
	var longestMarkSize = getTextPixelWith(yLabels[yLabels.length-1],backgroundCanvas)	
	//第一个列名称
	var firstColumnsNameSize = getTextPixelWith(data.columnsName[0],backgroundCanvas)
	if(firstColumnsNameSize/2>longestMarkSize){
		lableSpaceL2=firstColumnsNameSize/2;
		viewportX=lableSpaceL2+lableSpaceL;
	}else{
		lableSpaceL2=lableSpaceL;	
		viewportX=longestMarkSize+lableSpaceL2;
	}
	
	//计算rowsNameSpace
	//最长的行名称
	var longestRowName =longestStrOfArr(data.rowsName);	
	var longestrowsNameize = getTextPixelWith(longestRowName,backgroundCanvas)
	//
	var sumRowNameize = getTextPixelWith("总和",backgroundCanvas)
	if(sumRowNameize>longestrowsNameize){
		longestrowsNameize=sumRowNameize;
	}
	
   //最后一个列名称
	var lastColumnsNameSize = getTextPixelWith(data.columnsName[data.columnsName.length-1],backgroundCanvas)   
	if(lastColumnsNameSize/2>longestrowsNameize+rowColorLableWidth){		
		rowsNameSpace=lastColumnsNameSize/2+lableSpaceR;
	}else{
		rowsNameSpace=longestrowsNameize+rowColorLableWidth+lableSpaceR;
	}
	
	var colors = getConlors(data.rows.length);
	data.colors=colors;
	//每行数据显示颜色
	var color255 = colorsTo255(data.colors);
	data.color255=color255
	
	return data;
}


/**
 * 绘制图形
 * @param data
 * @returns
 */
function draw(data){
	var VSHADER_SOURCE =
		  'attribute vec4 a_Position;\n' +
		  'void main() {\n' +
		  '  gl_Position = a_Position;\n' +
		  '  gl_PointSize = 10.0;\n' +
		  '}\n';

	var FSHADER_SOURCE =
	  'precision mediump float;\n' +
	  'uniform vec4 u_FragColor;\n' + 
	  'void main() {\n' +
	  '  gl_FragColor = u_FragColor;\n' +
	  '}\n';

	
	var gl = getWebGLContext(glCanvas);
	
	if (!gl) {
	  console.log('Failed to get the rendering context for WebGL');
	  return;
	}
	
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
	  console.log('Failed to intialize shaders.');
	  return;
	}
	
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
	  console.log('Failed to get the storage location of a_Position');
	  return;
	}
	
	var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (!u_FragColor) {
	  console.log('Failed to get the storage location of u_FragColor');
	  return;
	}


	if(graphType=="table"){	

		gl.clear(gl.COLOR_BUFFER_BIT);
		
		drawTable(gl,u_FragColor,data);
		
		
	}else{
		
		var viewportWidth=glCanvas.width-viewportX-rowsNameSpace;
		var viewportHeight=glCanvas.height-viewportY-columnsNameSpace;
		gl.viewport(viewportX,columnsNameSpace, viewportWidth, viewportHeight);
		
		textCanvas.width=viewportWidth;
		textCanvas.height=viewportHeight;
		textCanvas.style.left=viewportX+"px";
		textCanvas.style.top=viewportY+"px";
		
	    drawCoord(data);
	    
		if(graphType=="line"){	
			drawLine(gl,u_FragColor,data);		
		}else if(graphType=="groupedBar"){	
			drawGroupedBar(gl,u_FragColor,data);		
		}else if(graphType=="stackedBar"){	
			drawStackedBar(gl,u_FragColor,data);
			
		}
	}
}

/**
 * 绘制表格
 * @param gl
 * @param u_FragColor
 * @param data
 * @returns
 */
function drawTable(gl,u_FragColor,data){
	//清理
	textCanvas.getContext("2d").clearRect(0, 0, textCanvas.width, textCanvas.height);
	textCanvas.width=0;
	textCanvas.height=0;
	textCanvas.onmousedown = function(ev){};
	backgroundCanvas.onmousedown = function(ev){};
	
	var ctx = backgroundCanvas.getContext("2d");	 
	var canvasWidth = backgroundCanvas.width;
	var canvasHeight = backgroundCanvas.height;	  
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	 
	ctx.strokeStyle = "rgba(0,0,0,255)";
	ctx.fillStyle =  "rgba(0,0,0,255)";
	  
	var columnsName =data.columnsName;
	var rowsName =data.rowsName;
	var rows = data.rows;
	
	//单行高
	var rowHeight = getTextPixelWith("高",backgroundCanvas)+paddingForCell*2;
	//总行高
	var totalRowHeight=rowHeight*(rowsName.length+1)
	//最宽列名宽度
	var columnWidthest=0;	
	for(var i=0;i<(columnsName.length+2);i++){
		var columnWidth = getTextPixelWith(columnsName[i],backgroundCanvas);		
		if(columnWidth>columnWidthest){
			columnWidthest=columnWidth;
		}
	}
	
	//最宽的数值
	var widthestNum=getTextPixelWith(data.yMax,backgroundCanvas);
	
	//总列宽
	var totalColumnsWidth=0;	
	if(widthestNum>columnWidthest){
		columnWidthest=widthestNum;
		
	}
	totalColumnsWidth=(columnWidthest+paddingForCell*2)*(columnsName.length+1)
	
	var clientHeight=document.documentElement.clientHeight;
	var clientWidth=document.documentElement.clientWidth;
	
	if(totalColumnsWidth>(clientWidth-lableSpaceL*2)){
		backgroundCanvas.width=totalColumnsWidth+lableSpaceL*2;	
	}
	
	if(totalRowHeight>(canvasHeight-viewportY)){			
		//扩大画板
		backgroundCanvas.height=totalRowHeight+viewportY+lableSpaceL;
		//扩大div容器	
		canvasDiv.style.height =  backgroundCanvas.height+"px";
	}
	
	ctx.font = defaultFont; 
	ctx.textAlign="center"; 
	ctx.textBaseline="top"; 
	
	//竖向满，横向满
	if(totalRowHeight>(canvasHeight-viewportY) && totalColumnsWidth>(clientWidth-lableSpaceL*2)){
		
		//竖线
		for(var i=0;i<(columnsName.length+2);i++){
			var x=(columnWidthest+paddingForCell*2)*i+lableSpaceL;//宽度占满，所以起点距离为默认距离
			  ctx.beginPath();			  
			  ctx.moveTo(x,viewportY);//高度占满，所以上空间为	viewportY		  
			  ctx.lineTo(x,totalRowHeight+viewportY);			  
			  ctx.stroke(); 
			  
			  if(i<columnsName.length){
			      ctx.fillText(columnsName[i], x+(columnWidthest+paddingForCell*2)+(columnWidthest+paddingForCell*2)/2, paddingForCell+viewportY);
			  
			  
			      for(let j=0;j<rows.length;j++){
			          ctx.fillText(rows[j][i],(x+columnWidthest+paddingForCell*2)+(columnWidthest+paddingForCell*2)/2, paddingForCell+viewportY+rowHeight*(j+1));
			      }
			  }
		}
		
		//横线
		for(var i=0;i<(rowsName.length+2);i++){			
			var y=rowHeight*i+viewportY;//高度占满，所以上空间为	viewportY		
			  ctx.beginPath();			  
			  ctx.moveTo(lableSpaceL,y);//横线占满，所以，左空间为lableSpaceL
			  ctx.lineTo(totalColumnsWidth+lableSpaceL,y);				  
			  ctx.stroke();  
			  
			  if(i<rowsName.length){
			      ctx.fillText(rowsName[i], lableSpaceL+(columnWidthest+paddingForCell*2)/2, y+paddingForCell+rowHeight);
			  }
		}
	//竖向满，横向未满
	}else if(totalRowHeight>(canvasHeight-viewportY)){		
		
		let margin=(backgroundCanvas.width-totalColumnsWidth)/2
		//横线
		for(var i=0;i<(rowsName.length+2);i++){			
			var y=rowHeight*i+viewportY;;			
			  ctx.beginPath();			  
			  ctx.moveTo(margin,y);
			  ctx.lineTo(totalColumnsWidth+margin,y);				  
			  ctx.stroke();  
			  
			  if(i<rowsName.length){
			      ctx.fillText(rowsName[i], margin+(columnWidthest+paddingForCell*2)/2, y+rowHeight+paddingForCell);
			  }
		}
		
		//竖线
		for(var i=0;i<(columnsName.length+2);i++){
			var x=(columnWidthest+paddingForCell*2)*i+margin;//横向未满，所以左空间为margin
			  ctx.beginPath();			  
			  ctx.moveTo(x,viewportY);//高度占满，所以上空间为	viewportY		  
			  ctx.lineTo(x,totalRowHeight+viewportY);			  
			  ctx.stroke(); 
			  
			  if(i<columnsName.length){
			      ctx.fillText(columnsName[i], x+(columnWidthest+paddingForCell*2)+(columnWidthest+paddingForCell*2)/2, paddingForCell+viewportY);
			  
			      for(let j=0;j<rows.length;j++){
			          ctx.fillText(rows[j][i], x+(columnWidthest+paddingForCell*2)+(columnWidthest+paddingForCell*2)/2, paddingForCell+viewportY+rowHeight*(j+1));
			      }
			  }
		}	
		
	//竖向未满，横线满
	}else if(totalColumnsWidth>(clientWidth-lableSpaceL*2)){
		let margin=(backgroundCanvas.height-totalRowHeight-viewportY)/2
		
		//竖线
		for(var i=0;i<(columnsName.length+2);i++){
			var x=(columnWidthest+paddingForCell*2)*i+lableSpaceL;
			  ctx.beginPath();			  
			  ctx.moveTo(x,viewportY+margin);			  
			  ctx.lineTo(x,totalRowHeight+viewportY+margin);			  
			  ctx.stroke(); 
			  
			  if(i<columnsName.length){
			      ctx.fillText(columnsName[i], x+(columnWidthest+paddingForCell*2)+(columnWidthest+paddingForCell*2)/2, paddingForCell+viewportY+margin);
			  
			      for(let j=0;j<rows.length;j++){
			          ctx.fillText(rows[j][i], x+(columnWidthest+paddingForCell*2)+(columnWidthest+paddingForCell*2)/2, paddingForCell+viewportY+margin+rowHeight*(j+1));
			      }
			  }
		}
		
		//横线
		for(var i=0;i<(rowsName.length+2);i++){			
			var y=rowHeight*i+margin+viewportY;			
			  ctx.beginPath();			  
			  ctx.moveTo(lableSpaceL,y);
			  ctx.lineTo(totalColumnsWidth+lableSpaceL,y);				  
			  ctx.stroke();  
			  
			  if(i<rowsName.length){
			      ctx.fillText(rowsName[i], lableSpaceL+(columnWidthest+paddingForCell*2)/2, y+paddingForCell+rowHeight);
			  }
		}
		
		
	}else{
		let marginHeight=(backgroundCanvas.height-totalRowHeight-viewportY)/2
		let marginWidth=(backgroundCanvas.width-totalColumnsWidth)/2
		
		//横线
		for(var i=0;i<(rowsName.length+2);i++){			
			var y=rowHeight*i+marginHeight+viewportY;			
			  ctx.beginPath();			  
			  ctx.moveTo(marginWidth,y);
			  ctx.lineTo(marginWidth+totalColumnsWidth,y);				  
			  ctx.stroke();  
			  
			  if(i<rowsName.length){
			      ctx.fillText(rowsName[i], marginWidth+(columnWidthest+paddingForCell*2)/2, y+paddingForCell+rowHeight);
			  }
		}		
		
		//竖线
		for(var i=0;i<(columnsName.length+2);i++){
			var x=(columnWidthest+paddingForCell*2)*i+marginWidth;//横向未满，所以左空间为margin
			  ctx.beginPath();			  
			  ctx.moveTo(x,(viewportY+marginHeight));//高度占满，所以上空间为	viewportY		  
			  ctx.lineTo(x,totalRowHeight+viewportY+marginHeight);			  
			  ctx.stroke();  
			  
			  if(i<columnsName.length){
			      ctx.fillText(columnsName[i], x+(columnWidthest+paddingForCell*2)+(columnWidthest+paddingForCell*2)/2, paddingForCell+(viewportY+marginHeight));
			  
			      for(let j=0;j<rows.length;j++){
			          ctx.fillText(rows[j][i], x+(columnWidthest+paddingForCell*2)+(columnWidthest+paddingForCell*2)/2, paddingForCell+viewportY+marginHeight+rowHeight*(j+1));
			      }
			  }
		}	
	}
	
	
	ctx.font = titleFont; 
	//显示标题
	ctx.textAlign="center"; 
	ctx.textBaseline="top"; 
	var titleX=backgroundCanvas.width/2;
	ctx.fillText(data.title, titleX, 5);
	
}



/**
 * 绘制坐标
 * @param data
 * @returns
 */
function drawCoord(data){
	if(graphType=="line"){
		drawCoordinate(data,"lfet");		
	}else if(graphType=="groupedBar"){			
		drawCoordinate(data,"middle");			
	}else if(graphType=="stackedBar"){		
		drawCoordinate(data,"middle");
		
	}
}



/**
 * 绘制柱形堆叠图
 * @param gl
 * @param u_FragColor
 * @param data
 * @returns
 */
function drawStackedBar(gl,u_FragColor,data){
	
	var rows=data.rows;
	var columnsNum=data.columnsName.length;
	
	var xValue = getXValueForLine(data.columnsName.length+1)	
	
	//var xValue = getXValueForBar(data.columnsName.length,data.rows.length)	
	
	var pointsArr=[];	
	var xDistance = (xValue[1]-xValue[0])/4
	
	for(var j=0;j<columnsNum;j++){			
		var x = xValue[j]+xDistance;		
		for(var i=0;i<rows.length;i++){	
			if(i==0){				
				var y= converY(rows[i][j],data.yCoordinateMax);						
				pointsArr.push(x, y);
				pointsArr.push(x,-1);		
				
				pointsArr.push(x+xDistance*2, y);
				pointsArr.push(x+xDistance*2,-1);	
				
			}else{				
				var y= converY(rows[i][j],data.yCoordinateMax);
				var yLast=pointsArr[pointsArr.length-3];
				
				if(y<0){
					y=1+y;
				}else{
					y=y+1;
				}				
				
				y=y+yLast;
				
				pointsArr.push(x, y);
				pointsArr.push(x,yLast);
				
				pointsArr.push(x+xDistance*2, y);
				pointsArr.push(x+xDistance*2,yLast);
				
				
			}
			
		}
	}
	
	 
		var n = initVertexBuffers(gl,pointsArr,u_FragColor);
		if (n < 0) {
		  console.log('Failed to set the positions of the vertices');
		  return;
		}
		
		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		
		var columnNum=data.columnsName.length;
		var rowNum = data.rows.length;
		
	    let textCtx=textCanvas.getContext("2d")
	    textCtx.textAlign="center"; 
	    textCtx.font=clickFont
	    textCtx.strokeStyle = "rgba(0,0,0,1)";
	    textCtx.fillStyle =  "rgba(0,0,0,1)";
		
	    
		var rectIndex=0;
		for(var c=1;c<=columnNum;c++){
			let columnsTotal=0;
			for(var i=0;i<rowNum;i++){
				if(rowColorLableClick[i]==1){
					rectIndex=rectIndex+4;
				}else{					
					var rgba = data.colors[i];
					gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);					
					gl.drawArrays(gl.TRIANGLE_STRIP, rectIndex, 4);
					
					
					columnsTotal+=data.rows[i][c-1];
					
					if(i==rowNum-1){					    
					    let x =(converTextX(pointsArr[rectIndex*2],textCanvas.width)+converTextX(pointsArr[rectIndex*2+4],textCanvas.width))/2
					    textCtx.fillText(columnsTotal,x, converTextY(pointsArr[rectIndex*2+1],textCanvas.height));
					}
					rectIndex=rectIndex+4;	
				}
			
			}
		}
}

/**
 * 绘制柱形分组图
 * @param gl
 * @param u_FragColor
 * @param data
 * @returns
 */
function drawGroupedBar(gl,u_FragColor,data){
	console.log('drawbar');
	
	var rows=data.rows;
	var columnsNum=data.columnsName.length;
	
	var xValue = getXValueForLine(data.columnsName.length+1)	
	
	//var xValue = getXValueForBar(data.columnsName.length,data.rows.length)	
	
	var pointsArr=[];	
	var xDistance = (xValue[1]-xValue[0])/(rows.length+2)
	for(var j=0;j<columnsNum;j++){		
		var xTmp=0;
		for(var i=0;i<rows.length+1;i++){			
			var x = xValue[j]+xDistance*(i+1);			
			if(i==0){				
				var y= converY(rows[i][j],data.yCoordinateMax);		
				pointsArr.push(x, y);
				pointsArr.push(x,-1);				
			}else if(i==(rows.length)){				
				var y= converY(rows[i-1][j],data.yCoordinateMax);
				pointsArr.push(x, y);
				pointsArr.push(x,-1);
			}else{				
				var y= converY(rows[i-1][j],data.yCoordinateMax);	
				pointsArr.push(x, y);
				pointsArr.push(x,-1);
				
				y= converY(rows[i][j],data.yCoordinateMax);
				pointsArr.push(x, y);
				pointsArr.push(x,-1);
				
			}
			
		}
	}
	
	 
		var n = initVertexBuffers(gl,pointsArr,u_FragColor);
		if (n < 0) {
		  console.log('Failed to set the positions of the vertices');
		  return;
		}
		
		
		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		
		var columnNum=data.columnsName.length;
		var rowNum = data.rows.length;
		
		
	    let textCtx=textCanvas.getContext("2d")
	    textCtx.textAlign="center"; 
	    textCtx.font=clickFont
	    textCtx.strokeStyle = "rgba(0,0,0,1)";
	    textCtx.fillStyle =  "rgba(0,0,0,1)";
		
		var rectIndex=0;
		for(var c=1;c<=columnNum;c++){
			for(var i=0;i<rowNum;i++){
				
				if(rowColorLableClick[i]==1){
					rectIndex=rectIndex+4;
				}else{
					
					var rgba = data.colors[i];
					gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);					
					gl.drawArrays(gl.TRIANGLE_STRIP, rectIndex, 4);					
									    
				    let x =(converTextX(pointsArr[rectIndex*2],textCanvas.width)+converTextX(pointsArr[rectIndex*2+4],textCanvas.width))/2
				    textCtx.fillText(rows[i][c-1],x, converTextY(pointsArr[rectIndex*2+1],textCanvas.height));
									
					rectIndex=rectIndex+4;
				}
				

			}
		}
}


/**
 * 绘制折线图
 * @param gl
 * @param u_FragColor
 * @param data
 * @returns
 */
function drawLine(gl,u_FragColor,data){	

	var xValue = getXValueForLine(data.columnsName.length)	
		//各数据点的y轴坐标值
	var yArr=converToYArr(data.rows,data.yCoordinateMax);
	
		  //点坐标数组
	 var pointsArr=[];
	 //列数
	  var len = yArr.length;   
	  for(var i = 0; i < len; i++) {
	    var points = yArr[i];    	    
	    for(var j=0;j<points.length;j++){
	        var y = points[j]	        
	        pointsArr.push(xValue[j], y);
	    } 
	  }
	  
	
	var n = initVertexBuffers(gl,pointsArr,u_FragColor);
	if (n < 0) {
	  console.log('Failed to set the positions of the vertices');
	  return;
	}
	

	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	var columnNum=data.columnsName.length;
	var rowNum = data.rows.length;
	for(var i=0;i<rowNum;i++){
		
		if(rowColorLableClick[i]==1){
			continue;
		}else{
			
			var rgba = data.colors[i];
			gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
			gl.drawArrays(gl.LINE_STRIP, columnNum*i, n/rowNum);
			gl.drawArrays(gl.POINTS, columnNum*i, n/rowNum);
		}
		
		
	}
}

/**
 * 绘制坐标值
 * @param space 坐标距离边缘的距离
 * @param xMark x轴的标签值数组
 * @param yLabels y轴标签值数组
 * @returns
 */
function drawCoordinate(data,columnNameAlign){	
	var columnsName = data.columnsName;
	var yLabels = data.yLabels;	
	var rowsName= data.rowsName;
	var color255 =data.color255;
	
	
	var ctx = backgroundCanvas.getContext("2d");
	  //获取Canvas的width、height
	  var canvasWidth = backgroundCanvas.width;
	  var canvasHeight = backgroundCanvas.height;
	  
	  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	 
	  ctx.strokeStyle = "rgba(0,0,0,255)";
	  ctx.fillStyle =  "rgba(0,0,0,255)";
	  ctx.font=defaultFont
	  
	  //设置三角形大小以及间隙大小
	  var arrowSize = 10;  
	  
	  //计算坐标系的原点坐标(x0,y0)
	  var x0 = viewportX;
	  var y0 = canvasHeight -columnsNameSpace;
	  
	  //计算坐标系y轴的最远坐标点(x1,y1)以及对应三角形的坐标点左边(x2,y2)\右边(x3,y3)
	  var x1 = x0;
	  var y1 = viewportY;

	  var x2 = Math.floor(x1 - arrowSize/2);
	  var y2 = Math.floor(y1 + arrowSize);

	  var x3 = Math.floor(x1 + arrowSize/2);
	  var y3 = Math.floor(y1 + arrowSize);

	  //绘画y轴的线条
	  ctx.beginPath();
	  ctx.moveTo(x0,y0); // 原点
	  ctx.lineTo(x1,y1); // y轴最远点

	  //绘画y轴三角形
	  ctx.lineTo(x2,y2); // 三角形左边点
	  ctx.lineTo(x3,y3); // 三角形右边点
	  ctx.lineTo(x1,y1); // 回到y轴最远点

	  //填充以及描边y轴
	  ctx.fill();	  
	  ctx.stroke();

	  //计算坐标系x轴的最远坐标点(x4,y4)以及对应三角形的坐标点上边(x5,y5)\下边(x6,y6)
	  var x4 = canvasWidth -rowsNameSpace;
	  var y4 = y0;

	  var x5 = Math.floor(x4 - arrowSize);
	  var y5 = Math.floor(y4 - arrowSize/2);

	  var x6 = Math.floor(x4 - arrowSize);
	  var y6 = Math.floor(y4 + arrowSize/2);

	  //绘制x轴线条
	  ctx.beginPath();
	  ctx.moveTo(x0,y0); // 原点
	  ctx.lineTo(x4,y4); // x轴最远点

	  //绘制三角形
	  ctx.lineTo(x5,y5); // 三角形的上边
	  ctx.lineTo(x6,y6); // 三角形的下边
	  ctx.lineTo(x4,y4); // 回到x轴最远点

	  //填充以及描边
	  ctx.fill();
	  ctx.stroke();
	  
	  //y轴长度
	  var yLenght=y0-y1;
	  var yLabelsLenght = yLabels.length;
	  //刻度间隔
	  var yDistance=yLenght/yLabelsLenght;
	  var markLenght = 5;
	  var xValue = viewportX+markLenght;
	  
	  //y轴刻度
	  ctx.textAlign = "center";
	  ctx.textBaseline = "middle";
	  ctx.strokeStyle = "rgba(0,0,0,1)";
	  ctx.fillStyle =  "rgba(0,0,0,1)";
	  for(var i=1;i<yLabelsLenght;i++){
		  var yValue =y1+yDistance*i;
		  ctx.beginPath();
		  ctx.moveTo(viewportX,yValue);
		  ctx.lineTo(xValue,yValue);		  
		  ctx.stroke();  		  
		  ctx.fillText(yLabels[yLabelsLenght-i], lableSpaceL2, yValue);
	  }	
	  
	  
	  //x轴长度
	  var xLenght=x4-x0;
	  
	  if(columnNameAlign=="lfet"){
		  
		  //刻度数量
		  var xMarkLenght = columnsName.length-1;
		  //刻度间隔
		  var xDistance=xLenght/(xMarkLenght);
		  //刻度长度
		  var markLenght = 5;
		  //x轴上刻度的y坐标
		  var xMarkYvalue = y0-markLenght;
		  
		  for(var i=0;i<=xMarkLenght;i++){
			  var xValue =x0+xDistance*i;//y轴刻度
			  ctx.beginPath();			  
			  ctx.moveTo(xValue,y0);
			  ctx.lineTo(xValue,xMarkYvalue);		  
			  ctx.stroke();  
			  ctx.textAlign="center"; 
			  ctx.textBaseline="bottom"; 
			  ctx.fillText(columnsName[i], xValue, y0+columnsNameSpace);
		  }	
		  
	  }else if(columnNameAlign=="middle"){
		  //刻度数量
		  var xMarkLenght = columnsName.length;
		  //刻度间隔
		  var xDistance=xLenght/xMarkLenght;
		  //刻度长度
		  var markLenght = 5;
		  //x轴上刻度的y坐标
		  var xMarkYvalue = y0-markLenght;
		  
		  for(var i=0;i<xMarkLenght;i++){
			  var xValue =x0+xDistance*i;
			  ctx.beginPath();
			  
			  ctx.moveTo(xValue,y0);
			  ctx.lineTo(xValue,xMarkYvalue);	
			  
			  ctx.stroke();  
			  ctx.textAlign="center"; 
			  ctx.textBaseline="bottom"; 
			  
			  xValue=xValue+xDistance/2
			  ctx.fillText(columnsName[i], xValue, y0+columnsNameSpace);
		  }	
	  }
	  
	  colorLabels=[]
	  
	  
	  //显示行名称
	  var rowsNameLength = rowsName.length;
	  //刻度间隔
	  var rowsNameDistance=yLenght/rowsNameLength;	  
	  for(var i=0;i<rowsNameLength;i++){
		  var yValue =y1+rowsNameDistance*i;	
		  var color=color255[i]
		  ctx.textAlign = "left";
		  ctx.textBaseline = "middle";
		  ctx.fillStyle = "rgba("+color[0]+","+color[1]+","+color[2]+","+color[3]+")";
		  
		  var colorLabe=[x4,yValue+1]
		  colorLabels.push(colorLabe)		  
		  if(rowColorLableClick[i]==1){
			  
			  ctx.fillRect(x4,yValue+2,rowColorLableWidth,rowColorLableHeight-4);
			  
			  ctx.fillStyle = "rgba(0,0,0,1)";
			  ctx.fillText(rowsName[i], x4+rowColorLableWidth, yValue+10);
			  
		  }else{
			  ctx.fillRect(x4,yValue+1,rowColorLableWidth,rowColorLableHeight);
			  
			  ctx.fillStyle = "rgba(0,0,0,1)";
			  ctx.fillText(rowsName[i], x4+rowColorLableWidth, yValue+10); 
		  }
			
	  }  
	  
	  
	  //显示标题
	  ctx.textAlign="center"; 
	  ctx.textBaseline="top"; 
	  var titleX=canvasWidth/2;
	  ctx.font=titleFont
	  ctx.fillText(data.title, titleX, 5);
	  
	  let textCtx=textCanvas.getContext("2d")
	  textCtx.textAlign="center"; 
	  textCtx.font=clickFont
	  textCanvas.onmousedown = function(ev){ click(ev,textCanvas); };
	  //监听背景canvas的点击事件
	  backgroundCanvas.onmousedown = function(ev){ clickBackgroundCanvas(ev,textCanvas); };	
}


function clickBackgroundCanvas(ev, canvas) { 
		  
	  var clientY = ev.clientY;
	  var clientX = ev.clientX;

		  //判断是否点中颜色块
		  for(var i=0;i<colorLabels.length;i++){
			  var colorLabe = colorLabels[i];
			  
			  if(colorLabe[0]<clientX&&clientX<(colorLabe[0]+rowColorLableWidth)&&
					  colorLabe[1]<clientY&&clientY<(colorLabe[1]+rowColorLableHeight)){
				
				  if(rowColorLableClick[i]==0){
					  rowColorLableClick[i]=1;
					  draw(currentData);
					  
					  break;
				  }	else{
					  rowColorLableClick[i]=0;
					  draw(currentData);
					  break;
				  }
				  
			  }
			  
		}
	  
}


/**
 * 鼠标点击事件
 * @param ev
 * @param canvas
 * @returns
 */
function click(ev, canvas) {	  
	  var clientY = ev.clientY;
	  var clientX = ev.clientX;
	  //var rect = ev.target.getBoundingClientRect() ;
  
	  //鼠标点在webgl上的坐标
	  var viewportWidth=canvas.width;	  
	  var weglX = (clientX-viewportX- viewportWidth/2)/(viewportWidth/2);	
	  
	  var viewportHeight=canvas.height;
	  
	  var weglY = (viewportHeight/2 + viewportY-clientY)/(viewportHeight/2);	
	  if((-1<weglY&&weglY<1)&& (-1<weglX&&weglX<1)){	  
		  
		  var yCoordinateMax =currentData.yCoordinateMax;
		  weglY=(weglY+1)*yCoordinateMax/2;	
		  
		  var ctx = canvas.getContext("2d");
		  ctx.strokeStyle = "rgba(0,0,0,1)";
		  ctx.fillStyle =  "rgba(0,0,0,1)";
		  ctx.fillText(Math.round(weglY), clientX-viewportX, clientY-viewportY);
	  }	
}


/**
 * 给展示的数据增加行
 * @param row
 * @param rowName
 * @returns
 */
function addRow2CurrentData(row,rowName){	
	currentData.rows.push(row);
	currentData.rowsName.push(rowName);	
}



/**
 * 数据转置
 * @param data
 * @returns
 */
function transposeData(data){
	
	transData.columnsName=data.rowsName;
	transData.rowsName=data.columnsName;
	var rows =transposeArr(data.rows);
	transData.rows=rows;
	transData.title=data.title;
	
	return transData;
}


/**
 * 画板大小自适应
 */
function changeCanvas() {
	var clientHeight=document.documentElement.clientHeight;
	var clientWidth=document.documentElement.clientWidth;	
	
	backgroundCanvas.height = clientHeight - bottomSpace;
	glCanvas.height = clientHeight - bottomSpace;	
	
	backgroundCanvas.width = clientWidth;
	glCanvas.width = clientWidth;	
	
	//设置与canvas重叠的div的大小，以撑开后面的div
	canvasDiv.style.height =  backgroundCanvas.height+"px";
	canvasDiv.style.width = "100vw";    
}


/**
 * 初始化缓冲区数据
 * @param gl
 * @param u_FragColor
 * @returns
 */
function initVertexBuffers(gl,pointsArr,u_FragColor) {
	
	  var vertices = new Float32Array(pointsArr);
	  //点的数量
	  var n = pointsArr.length/2; 
	  
	  var vertexBuffer = gl.createBuffer();
	  if (!vertexBuffer) {
	    console.log('Failed to create the buffer object');
	    return -1;
	  }
	  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	  if (a_Position < 0) {
	    console.log('Failed to get the storage location of a_Position');
	    return -1;
	  }
	  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
	  gl.enableVertexAttribArray(a_Position);

	  return n;
}

/**
 * 获取不定维数组中元素的最大值
 * @param arr多维数组
 * @returns
 */
function largerstOfArr(arr){
	
	if(graphType=="stackedBar"){
		
		//利用转置后的数据计算更方便
		var rows=transposeArr(currentData.rows);
		
		var maxSum=0;
		for(var i=0;i<rows.length;i++){
			var sum = rows[i].reduce((x,y)=>x+y)
	
			if(sum>maxSum){
				maxSum=sum;
			}
		}
		
		return maxSum;
		
	}else{
	
		var newArray=arr.join(",").split(",");
		return Math.max.apply({},newArray);	
	}
}












/**
 * 获取总和
 * @param data
 * @returns
 */
function getSumRow(data){
	var rows =data.rows;
	var sumRow =[];
	for(var i=0;i<rows.length;i++){
		var row =rows[i];
		for(var j=0;j<row.length;j++){				
			if(sumRow[j]==undefined){
				sumRow.push(row[j])
			}else{
				sumRow[j] = sumRow[j]+row[j]
			}
		}
	}	
	return sumRow;
}

/**
 * 获取平均值
 * @param sumRow
 * @returns
 */
function getAvgRow(sumRow,rowNum){	
	var avgRow =[];
	for(var i=0;i<sumRow.length;i++){		
		avgRow[i] = Math.round((sumRow[i]/rowNum)*100)/100;
			
	}	
	return avgRow;
}

/**
 * 获取x轴刻度坐标值数组
 * @param columnsName
 * @returns
 */
function getXValueForLine(columnNum){

	  //x轴刻度标签间隔
	  var xDistance = 2/(columnNum-1);
	  //x轴刻度坐标值数组
	  var xValue = [];
	  for(var i=0;i<columnNum;i++){
		  var x=xDistance*i-1;
		  xValue[i]=x;
	  }
	  return xValue;
}

function getXValueForBar(columnNum,rowNum){	
	  
	  //x轴点分割的数量,柱形数量加上每两个列之间相隔两个柱形宽的距离，再前后各加一个柱形宽
	  var xNum=rowNum*columnNum+ (columnNum-1)*2+2;
	  //x轴刻度标签间隔
	  var xDistance = 2/xNum;	  
	  //x轴刻度坐标值数组
	  var xValue = [];
	  for(var i=0;i<xNum;i++){
		  xValue[i]=xDistance*i-1;
	  }
	  return xValue;
}






/**
 * 行数据转为点坐标，也即y轴坐标
 * @param rows
 * @param maxY
 * @returns
 */
function  converToYArr(rows,maxY){
	//行数
	var rowLength = rows.length;
	//列数
	var columnLength=rows[0].length;
	//解析出的每行数据每个点的y轴坐标
	var yArr=[];
	//转换y轴坐标的值
	for(var i=0;i<rowLength;i++){	  
		  var row = rows[i];
		  var rowResult=[];
		  for(var j=0;j<columnLength;j++){	  
			  var value = row[j];
			  var y=(value/maxY)*2-1
			  rowResult[j]=y;
		}
		  yArr[i]=rowResult;		  
	}
	return yArr;
}


/**
 * 获取单行文本的像素宽度
 * @param text
 * @param canvas
 * @returns
 */
function getTextPixelWith(text,canvas){   
	ctx =canvas.getContext("2d");
	ctx.font = defaultFont; 
    var dimension = ctx.measureText(text);
    return dimension.width;
}


/**
 * 将原始数据转换为y坐标
 * @param y
 * @param maxY
 * @returns
 */
function  converY(y,maxY){
	return (y/maxY)*2-1;
}

/**
 * 0-1坐标转为数值坐标
 * @param y
 * @param maxY
 * @returns
 */
function  converTextY(y,height){
	return height-(y+1)*height/2;
}

function  converTextX(x,width){
	return (x+1)*width/2;
}

/**
 * 获取y轴刻度标签坐标值数组
 * @param maxY 标签最大值
 * @param yDisatance 每个标签间间隔
 * @returns
 */
function getyLabels(maxY,yNum){
	  
	  //y轴坐标刻度标签数组
	  var yLabels=[];	  
	  //y轴刻度间隔
	  var yDisatance=Math.ceil(maxY/yNum);
	  //获取y轴刻度标签数组
	  for(var i=0;i<yNum;i++){
		  var yLabelsValue=yDisatance*i;
		  yLabels[i]=yLabelsValue;
	  }
	  return yLabels;
}




/**
 * 范式化最大值，使它转换为刻度的最大值。如最大值550，则输出600，
 * @param num
 * @returns
 */
function normalizeMax(num){
	var int = Math.ceil(num);
	var intStr = int.toString()
	var 　intLength = intStr.length;
	var intFirst = parseInt(intStr.substring(0,1));	
	var result = Math.pow(10,intLength-1)*(intFirst+1);	
	return result;
}


/**
 * 随机生成HSL颜色3元组
 * @returns
 */
function randomHsl() {
  var H = Math.random();
  var S = Math.random();
  var L = Math.random();
  return [H, S, L];
}

/**
 * 获取n个颜色数组
 * @param n
 * @returns
 */
function getConlors(n) {
  var HSL = [[1.0,0.0,0.0,1.0],
	  [0.0,1.0,0.0,1.0],
	  [0.0,0.0,1.0,1.0],
	  [1.0,1.0,0.0,1.0],
	  [1.0,0.0,1.0,1.0],
	  [0.0,1.0,1.0,1.0],
	  [0.5,0.0,0.0,1.0],
	  [0.0,0.5,0.0,1.0],
	  [0.0,0.0,0.5,1.0],
	  [0.5,0.5,0.0,1.0],
	  [0.5,0.0,0.5,1.0],
	  [0.0,0.5,0.5,1.0],
	  [0.5,0.5,0.5,1.0],
	  [0.0,0.0,0.0,1.0]];
  
  if(n<15){
	  return HSL;
  }
  
  var hslLength = n-9; // 获取数量
  for (var i = 0; i < hslLength; i++) {
    var ret = randomHsl();

    // 颜色相邻颜色差异须大于 0.25
    if (i > 0 && Math.abs(ret[0] - HSL[i - 1][0]) < 0.25) {
      i--;
      continue; // 重新获取随机色
    }
    ret[1] = 0.7 + (ret[1] * 0.2); // [0.7 - 0.9] 排除过灰颜色
    ret[2] = 0.4 + (ret[2] * 0.4); // [0.4 - 0.8] 排除过亮过暗色
    ret[3]=1.0;
    
    // 数据转化到小数点后两位
    ret = ret.map(function (item) {
      return parseFloat(item.toFixed(2));
    });

    HSL.push(ret);
  }
  return HSL;
}


/**
 * 数组转置
 * @param arr
 * @returns
 */
function transposeArr(arr){
	var newArray = arr[0].map(function(col, i) {
		　　return arr.map(function(row) {
		　　　　return row[i];
		　　})
		});
	return newArray;
}

/**
 * 获取数组中最长的元素
 * @param arr
 * @returns
 */
function longestStrOfArr(arr){
	var result=arr[0]
	for(var i=0;i<arr.length;i++){
		var elem = arr[i];
		if(result.length<elem.length){
			result=elem;
		}
	}
	return result;
}


/**
 * 通过js的内置对象JSON来进行数组对象的深拷贝
 * @param obj
 * @returns
 */
function deepClone(obj) {
  var _obj = JSON.stringify(obj),
    objClone = JSON.parse(_obj);
  return objClone;
}
















/**********************************webgl-utils************************/
/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         window.requestAnimationFrame(render, canvas);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 */

WebGLUtils = function() {

/**
 * Creates the HTLM for a failure message
 * @param {string} canvasContainerId id of container of th
 *        canvas.
 * @return {string} The html.
 */
var makeFailHTML = function(msg) {
  return '' +
        '<div style="margin: auto; width:500px;z-index:10000;margin-top:20em;text-align:center;">' + msg + '</div>';
  return '' +
    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
    '<td align="center">' +
    '<div style="display: table-cell; vertical-align: middle;">' +
    '<div style="">' + msg + '</div>' +
    '</div>' +
    '</td></tr></table>';
};

/**
 * Mesasge for getting a webgl browser
 * @type {string}
 */
var GET_A_WEBGL_BROWSER = '' +
  'This page requires a browser that supports WebGL.<br/>' +
  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

/**
 * Mesasge for need better hardware
 * @type {string}
 */
var OTHER_PROBLEM = '' +
  "It doesn't appear your computer can support WebGL.<br/>" +
  '<a href="http://get.webgl.org">Click here for more information.</a>';

/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {Element} canvas. The canvas element to create a
 *     context from.
 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
 *     creation attributes you want to pass in.
 * @param {function:(msg)} opt_onError An function to call
 *     if there is an error during creation.
 * @return {WebGLRenderingContext} The created context.
 */
var setupWebGL = function(canvas, opt_attribs, opt_onError) {
  function handleCreationError(msg) {
      var container = document.getElementsByTagName("body")[0];
    //var container = canvas.parentNode;
    if (container) {
      var str = window.WebGLRenderingContext ?
           OTHER_PROBLEM :
           GET_A_WEBGL_BROWSER;
      if (msg) {
        str += "<br/><br/>Status: " + msg;
      }
      container.innerHTML = makeFailHTML(str);
    }
  };

  opt_onError = opt_onError || handleCreationError;

  if (canvas.addEventListener) {
    canvas.addEventListener("webglcontextcreationerror", function(event) {
          opt_onError(event.statusMessage);
        }, false);
  }
  var context = create3DContext(canvas, opt_attribs);
  if (!context) {
    if (!window.WebGLRenderingContext) {
      opt_onError("");
    } else {
      opt_onError("");
    }
  }

  return context;
};

/**
 * Creates a webgl context.
 * @param {!Canvas} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLContext} The created context.
 */
var create3DContext = function(canvas, opt_attribs) {
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  return context;
}

return {
  create3DContext: create3DContext,
  setupWebGL: setupWebGL
};
}();

/**
 * Provides requestAnimationFrame in a cross browser
 * way.
 */
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
             window.setTimeout(callback, 1000/60);
           };
  })();
}

/** * ERRATA: 'cancelRequestAnimationFrame' renamed to 'cancelAnimationFrame' to reflect an update to the W3C Animation-Timing Spec. 
 * 
 * Cancels an animation frame request. 
 * Checks for cross-browser support, falls back to clearTimeout. 
 * @param {number}  Animation frame request. */
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (window.cancelRequestAnimationFrame ||
                                 window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame ||
                                 window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame ||
                                 window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame ||
                                 window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame ||
                                 window.clearTimeout);
}


/**********************webgl-debug.js**************************************/

//Copyright (c) 2009 The Chromium Authors. All rights reserved.
//Use of this source code is governed by a BSD-style license that can be
//found in the LICENSE file.

//Various functions for helping debug WebGL apps.

WebGLDebugUtils = function() {

/**
* Wrapped logging function.
* @param {string} msg Message to log.
*/
var log = function(msg) {
if (window.console && window.console.log) {
  window.console.log(msg);
}
};

/**
* Which arguements are enums.
* @type {!Object.<number, string>}
*/
var glValidEnumContexts = {

// Generic setters and getters

'enable': { 0:true },
'disable': { 0:true },
'getParameter': { 0:true },

// Rendering

'drawArrays': { 0:true },
'drawElements': { 0:true, 2:true },

// Shaders

'createShader': { 0:true },
'getShaderParameter': { 1:true },
'getProgramParameter': { 1:true },

// Vertex attributes

'getVertexAttrib': { 1:true },
'vertexAttribPointer': { 2:true },

// Textures

'bindTexture': { 0:true },
'activeTexture': { 0:true },
'getTexParameter': { 0:true, 1:true },
'texParameterf': { 0:true, 1:true },
'texParameteri': { 0:true, 1:true, 2:true },
'texImage2D': { 0:true, 2:true, 6:true, 7:true },
'texSubImage2D': { 0:true, 6:true, 7:true },
'copyTexImage2D': { 0:true, 2:true },
'copyTexSubImage2D': { 0:true },
'generateMipmap': { 0:true },

// Buffer objects

'bindBuffer': { 0:true },
'bufferData': { 0:true, 2:true },
'bufferSubData': { 0:true },
'getBufferParameter': { 0:true, 1:true },

// Renderbuffers and framebuffers

'pixelStorei': { 0:true, 1:true },
'readPixels': { 4:true, 5:true },
'bindRenderbuffer': { 0:true },
'bindFramebuffer': { 0:true },
'checkFramebufferStatus': { 0:true },
'framebufferRenderbuffer': { 0:true, 1:true, 2:true },
'framebufferTexture2D': { 0:true, 1:true, 2:true },
'getFramebufferAttachmentParameter': { 0:true, 1:true, 2:true },
'getRenderbufferParameter': { 0:true, 1:true },
'renderbufferStorage': { 0:true, 1:true },

// Frame buffer operations (clear, blend, depth test, stencil)

'clear': { 0:true },
'depthFunc': { 0:true },
'blendFunc': { 0:true, 1:true },
'blendFuncSeparate': { 0:true, 1:true, 2:true, 3:true },
'blendEquation': { 0:true },
'blendEquationSeparate': { 0:true, 1:true },
'stencilFunc': { 0:true },
'stencilFuncSeparate': { 0:true, 1:true },
'stencilMaskSeparate': { 0:true },
'stencilOp': { 0:true, 1:true, 2:true },
'stencilOpSeparate': { 0:true, 1:true, 2:true, 3:true },

// Culling

'cullFace': { 0:true },
'frontFace': { 0:true },
};

/**
* Map of numbers to names.
* @type {Object}
*/
var glEnums = null;

/**
* Initializes this module. Safe to call more than once.
* @param {!WebGLRenderingContext} ctx A WebGL context. If
*    you have more than one context it doesn't matter which one
*    you pass in, it is only used to pull out constants.
*/
function init(ctx) {
if (glEnums == null) {
  glEnums = { };
  for (var propertyName in ctx) {
    if (typeof ctx[propertyName] == 'number') {
      glEnums[ctx[propertyName]] = propertyName;
    }
  }
}
}

/**
* Checks the utils have been initialized.
*/
function checkInit() {
if (glEnums == null) {
  throw 'WebGLDebugUtils.init(ctx) not called';
}
}

/**
* Returns true or false if value matches any WebGL enum
* @param {*} value Value to check if it might be an enum.
* @return {boolean} True if value matches one of the WebGL defined enums
*/
function mightBeEnum(value) {
checkInit();
return (glEnums[value] !== undefined);
}

/**
* Gets an string version of an WebGL enum.
*
* Example:
*   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
*
* @param {number} value Value to return an enum for
* @return {string} The string version of the enum.
*/
function glEnumToString(value) {
checkInit();
var name = glEnums[value];
return (name !== undefined) ? name :
    ("*UNKNOWN WebGL ENUM (0x" + value.toString(16) + ")");
}

/**
* Returns the string version of a WebGL argument.
* Attempts to convert enum arguments to strings.
* @param {string} functionName the name of the WebGL function.
* @param {number} argumentIndx the index of the argument.
* @param {*} value The value of the argument.
* @return {string} The value as a string.
*/
function glFunctionArgToString(functionName, argumentIndex, value) {
var funcInfo = glValidEnumContexts[functionName];
if (funcInfo !== undefined) {
  if (funcInfo[argumentIndex]) {
    return glEnumToString(value);
  }
}
return value.toString();
}

/**
* Given a WebGL context returns a wrapped context that calls
* gl.getError after every command and calls a function if the
* result is not gl.NO_ERROR.
*
* @param {!WebGLRenderingContext} ctx The webgl context to
*        wrap.
* @param {!function(err, funcName, args): void} opt_onErrorFunc
*        The function to call when gl.getError returns an
*        error. If not specified the default function calls
*        console.log with a message.
*/
function makeDebugContext(ctx, opt_onErrorFunc) {
init(ctx);
opt_onErrorFunc = opt_onErrorFunc || function(err, functionName, args) {
      // apparently we can't do args.join(",");
      var argStr = "";
      for (var ii = 0; ii < args.length; ++ii) {
        argStr += ((ii == 0) ? '' : ', ') +
            glFunctionArgToString(functionName, ii, args[ii]);
      }
      log("WebGL error "+ glEnumToString(err) + " in "+ functionName +
          "(" + argStr + ")");
    };

// Holds booleans for each GL error so after we get the error ourselves
// we can still return it to the client app.
var glErrorShadow = { };

// Makes a function that calls a WebGL function and then calls getError.
function makeErrorWrapper(ctx, functionName) {
  return function() {
    var result = ctx[functionName].apply(ctx, arguments);
    var err = ctx.getError();
    if (err != 0) {
      glErrorShadow[err] = true;
      opt_onErrorFunc(err, functionName, arguments);
    }
    return result;
  };
}

// Make a an object that has a copy of every property of the WebGL context
// but wraps all functions.
var wrapper = {};
for (var propertyName in ctx) {
  if (typeof ctx[propertyName] == 'function') {
     wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
   } else {
     wrapper[propertyName] = ctx[propertyName];
   }
}

// Override the getError function with one that returns our saved results.
wrapper.getError = function() {
  for (var err in glErrorShadow) {
    if (glErrorShadow[err]) {
      glErrorShadow[err] = false;
      return err;
    }
  }
  return ctx.NO_ERROR;
};

return wrapper;
}

function resetToInitialState(ctx) {
var numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
var tmp = ctx.createBuffer();
ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp);
for (var ii = 0; ii < numAttribs; ++ii) {
  ctx.disableVertexAttribArray(ii);
  ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0);
  ctx.vertexAttrib1f(ii, 0);
}
ctx.deleteBuffer(tmp);

var numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);
for (var ii = 0; ii < numTextureUnits; ++ii) {
  ctx.activeTexture(ctx.TEXTURE0 + ii);
  ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null);
  ctx.bindTexture(ctx.TEXTURE_2D, null);
}

ctx.activeTexture(ctx.TEXTURE0);
ctx.useProgram(null);
ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
ctx.disable(ctx.BLEND);
ctx.disable(ctx.CULL_FACE);
ctx.disable(ctx.DEPTH_TEST);
ctx.disable(ctx.DITHER);
ctx.disable(ctx.SCISSOR_TEST);
ctx.blendColor(0, 0, 0, 0);
ctx.blendEquation(ctx.FUNC_ADD);
ctx.blendFunc(ctx.ONE, ctx.ZERO);
ctx.clearColor(0, 0, 0, 0);
ctx.clearDepth(1);
ctx.clearStencil(-1);
ctx.colorMask(true, true, true, true);
ctx.cullFace(ctx.BACK);
ctx.depthFunc(ctx.LESS);
ctx.depthMask(true);
ctx.depthRange(0, 1);
ctx.frontFace(ctx.CCW);
ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE);
ctx.lineWidth(1);
ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4);
ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4);
ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
// TODO: Delete this IF.
if (ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
  ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, ctx.BROWSER_DEFAULT_WEBGL);
}
ctx.polygonOffset(0, 0);
ctx.sampleCoverage(1, false);
ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height);
ctx.stencilFunc(ctx.ALWAYS, 0, 0xFFFFFFFF);
ctx.stencilMask(0xFFFFFFFF);
ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
ctx.viewport(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT);

// TODO: This should NOT be needed but Firefox fails with 'hint'
while(ctx.getError());
}

function makeLostContextSimulatingContext(ctx) {
var wrapper_ = {};
var contextId_ = 1;
var contextLost_ = false;
var resourceId_ = 0;
var resourceDb_ = [];
var onLost_ = undefined;
var onRestored_ = undefined;
var nextOnRestored_ = undefined;

// Holds booleans for each GL error so can simulate errors.
var glErrorShadow_ = { };

function isWebGLObject(obj) {
  //return false;
  return (obj instanceof WebGLBuffer ||
          obj instanceof WebGLFramebuffer ||
          obj instanceof WebGLProgram ||
          obj instanceof WebGLRenderbuffer ||
          obj instanceof WebGLShader ||
          obj instanceof WebGLTexture);
}

function checkResources(args) {
  for (var ii = 0; ii < args.length; ++ii) {
    var arg = args[ii];
    if (isWebGLObject(arg)) {
      return arg.__webglDebugContextLostId__ == contextId_;
    }
  }
  return true;
}

function clearErrors() {
  var k = Object.keys(glErrorShadow_);
  for (var ii = 0; ii < k.length; ++ii) {
    delete glErrorShdow_[k];
  }
}

// Makes a function that simulates WebGL when out of context.
function makeLostContextWrapper(ctx, functionName) {
  var f = ctx[functionName];
  return function() {
    // Only call the functions if the context is not lost.
    if (!contextLost_) {
      if (!checkResources(arguments)) {
        glErrorShadow_[ctx.INVALID_OPERATION] = true;
        return;
      }
      var result = f.apply(ctx, arguments);
      return result;
    }
  };
}

for (var propertyName in ctx) {
  if (typeof ctx[propertyName] == 'function') {
     wrapper_[propertyName] = makeLostContextWrapper(ctx, propertyName);
   } else {
     wrapper_[propertyName] = ctx[propertyName];
   }
}

function makeWebGLContextEvent(statusMessage) {
  return {statusMessage: statusMessage};
}

function freeResources() {
  for (var ii = 0; ii < resourceDb_.length; ++ii) {
    var resource = resourceDb_[ii];
    if (resource instanceof WebGLBuffer) {
      ctx.deleteBuffer(resource);
    } else if (resource instanceof WebctxFramebuffer) {
      ctx.deleteFramebuffer(resource);
    } else if (resource instanceof WebctxProgram) {
      ctx.deleteProgram(resource);
    } else if (resource instanceof WebctxRenderbuffer) {
      ctx.deleteRenderbuffer(resource);
    } else if (resource instanceof WebctxShader) {
      ctx.deleteShader(resource);
    } else if (resource instanceof WebctxTexture) {
      ctx.deleteTexture(resource);
    }
  }
}

wrapper_.loseContext = function() {
  if (!contextLost_) {
    contextLost_ = true;
    ++contextId_;
    while (ctx.getError());
    clearErrors();
    glErrorShadow_[ctx.CONTEXT_LOST_WEBGL] = true;
    setTimeout(function() {
        if (onLost_) {
          onLost_(makeWebGLContextEvent("context lost"));
        }
      }, 0);
  }
};

wrapper_.restoreContext = function() {
  if (contextLost_) {
    if (onRestored_) {
      setTimeout(function() {
          freeResources();
          resetToInitialState(ctx);
          contextLost_ = false;
          if (onRestored_) {
            var callback = onRestored_;
            onRestored_ = nextOnRestored_;
            nextOnRestored_ = undefined;
            callback(makeWebGLContextEvent("context restored"));
          }
        }, 0);
    } else {
      throw "You can not restore the context without a listener"
    }
  }
};

// Wrap a few functions specially.
wrapper_.getError = function() {
  if (!contextLost_) {
    var err;
    while (err = ctx.getError()) {
      glErrorShadow_[err] = true;
    }
  }
  for (var err in glErrorShadow_) {
    if (glErrorShadow_[err]) {
      delete glErrorShadow_[err];
      return err;
    }
  }
  return ctx.NO_ERROR;
};

var creationFunctions = [
  "createBuffer",
  "createFramebuffer",
  "createProgram",
  "createRenderbuffer",
  "createShader",
  "createTexture"
];
for (var ii = 0; ii < creationFunctions.length; ++ii) {
  var functionName = creationFunctions[ii];
  wrapper_[functionName] = function(f) {
    return function() {
      if (contextLost_) {
        return null;
      }
      var obj = f.apply(ctx, arguments);
      obj.__webglDebugContextLostId__ = contextId_;
      resourceDb_.push(obj);
      return obj;
    };
  }(ctx[functionName]);
}

var functionsThatShouldReturnNull = [
  "getActiveAttrib",
  "getActiveUniform",
  "getBufferParameter",
  "getContextAttributes",
  "getAttachedShaders",
  "getFramebufferAttachmentParameter",
  "getParameter",
  "getProgramParameter",
  "getProgramInfoLog",
  "getRenderbufferParameter",
  "getShaderParameter",
  "getShaderInfoLog",
  "getShaderSource",
  "getTexParameter",
  "getUniform",
  "getUniformLocation",
  "getVertexAttrib"
];
for (var ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {
  var functionName = functionsThatShouldReturnNull[ii];
  wrapper_[functionName] = function(f) {
    return function() {
      if (contextLost_) {
        return null;
      }
      return f.apply(ctx, arguments);
    }
  }(wrapper_[functionName]);
}

var isFunctions = [
  "isBuffer",
  "isEnabled",
  "isFramebuffer",
  "isProgram",
  "isRenderbuffer",
  "isShader",
  "isTexture"
];
for (var ii = 0; ii < isFunctions.length; ++ii) {
  var functionName = isFunctions[ii];
  wrapper_[functionName] = function(f) {
    return function() {
      if (contextLost_) {
        return false;
      }
      return f.apply(ctx, arguments);
    }
  }(wrapper_[functionName]);
}

wrapper_.checkFramebufferStatus = function(f) {
  return function() {
    if (contextLost_) {
      return ctx.FRAMEBUFFER_UNSUPPORTED;
    }
    return f.apply(ctx, arguments);
  };
}(wrapper_.checkFramebufferStatus);

wrapper_.getAttribLocation = function(f) {
  return function() {
    if (contextLost_) {
      return -1;
    }
    return f.apply(ctx, arguments);
  };
}(wrapper_.getAttribLocation);

wrapper_.getVertexAttribOffset = function(f) {
  return function() {
    if (contextLost_) {
      return 0;
    }
    return f.apply(ctx, arguments);
  };
}(wrapper_.getVertexAttribOffset);

wrapper_.isContextLost = function() {
  return contextLost_;
};

function wrapEvent(listener) {
  if (typeof(listener) == "function") {
    return listener;
  } else {
    return function(info) {
      listener.handleEvent(info);
    }
  }
}

wrapper_.registerOnContextLostListener = function(listener) {
  onLost_ = wrapEvent(listener);
};

wrapper_.registerOnContextRestoredListener = function(listener) {
  if (contextLost_) {
    nextOnRestored_ = wrapEvent(listener);
  } else {
    onRestored_ = wrapEvent(listener);
  }
}

return wrapper_;
}

return {
/**
 * Initializes this module. Safe to call more than once.
 * @param {!WebGLRenderingContext} ctx A WebGL context. If
 *    you have more than one context it doesn't matter which one
 *    you pass in, it is only used to pull out constants.
 */
'init': init,

/**
 * Returns true or false if value matches any WebGL enum
 * @param {*} value Value to check if it might be an enum.
 * @return {boolean} True if value matches one of the WebGL defined enums
 */
'mightBeEnum': mightBeEnum,

/**
 * Gets an string version of an WebGL enum.
 *
 * Example:
 *   WebGLDebugUtil.init(ctx);
 *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
 *
 * @param {number} value Value to return an enum for
 * @return {string} The string version of the enum.
 */
'glEnumToString': glEnumToString,

/**
 * Converts the argument of a WebGL function to a string.
 * Attempts to convert enum arguments to strings.
 *
 * Example:
 *   WebGLDebugUtil.init(ctx);
 *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 0, gl.TEXTURE_2D);
 *
 * would return 'TEXTURE_2D'
 *
 * @param {string} functionName the name of the WebGL function.
 * @param {number} argumentIndx the index of the argument.
 * @param {*} value The value of the argument.
 * @return {string} The value as a string.
 */
'glFunctionArgToString': glFunctionArgToString,

/**
 * Given a WebGL context returns a wrapped context that calls
 * gl.getError after every command and calls a function if the
 * result is not NO_ERROR.
 *
 * You can supply your own function if you want. For example, if you'd like
 * an exception thrown on any GL error you could do this
 *
 *    function throwOnGLError(err, funcName, args) {
 *      throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to" +
 *            funcName;
 *    };
 *
 *    ctx = WebGLDebugUtils.makeDebugContext(
 *        canvas.getContext("webgl"), throwOnGLError);
 *
 * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
 * @param {!function(err, funcName, args): void} opt_onErrorFunc The function
 *     to call when gl.getError returns an error. If not specified the default
 *     function calls console.log with a message.
 */
'makeDebugContext': makeDebugContext,

/**
 * Given a WebGL context returns a wrapped context that adds 4
 * functions.
 *
 * ctx.loseContext:
 *   simulates a lost context event.
 *
 * ctx.restoreContext:
 *   simulates the context being restored.
 *
 * ctx.registerOnContextLostListener(listener):
 *   lets you register a listener for context lost. Use instead
 *   of addEventListener('webglcontextlostevent', listener);
 *
 * ctx.registerOnContextRestoredListener(listener):
 *   lets you register a listener for context restored. Use
 *   instead of addEventListener('webglcontextrestored',
 *   listener);
 *
 * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
 */
'makeLostContextSimulatingContext': makeLostContextSimulatingContext,

/**
 * Resets a context to the initial state.
 * @param {!WebGLRenderingContext} ctx The webgl context to
 *     reset.
 */
'resetToInitialState': resetToInitialState
};

}();


/***************************cuon-matrix.js**********************************/

//cuon-matrix.js (c) 2012 kanda and matsuda
/** 
 * This is a class treating 4x4 matrix.
 * This class contains the function that is equivalent to OpenGL matrix stack.
 * The matrix after conversion is calculated by multiplying a conversion matrix from the right.
 * The matrix is replaced by the calculated result.
 */

/**
 * Constructor of Matrix4
 * If opt_src is specified, new matrix is initialized by opt_src.
 * Otherwise, new matrix is initialized by identity matrix.
 * @param opt_src source matrix(option)
 */
var Matrix4 = function(opt_src) {
  var i, s, d;
  if (opt_src && typeof opt_src === 'object' && opt_src.hasOwnProperty('elements')) {
    s = opt_src.elements;
    d = new Float32Array(16);
    for (i = 0; i < 16; ++i) {
      d[i] = s[i];
    }
    this.elements = d;
  } else {
    this.elements = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  }
};

/**
 * Set the identity matrix.
 * @return this
 */
Matrix4.prototype.setIdentity = function() {
  var e = this.elements;
  e[0] = 1;   e[4] = 0;   e[8]  = 0;   e[12] = 0;
  e[1] = 0;   e[5] = 1;   e[9]  = 0;   e[13] = 0;
  e[2] = 0;   e[6] = 0;   e[10] = 1;   e[14] = 0;
  e[3] = 0;   e[7] = 0;   e[11] = 0;   e[15] = 1;
  return this;
};

/**
 * Copy matrix.
 * @param src source matrix
 * @return this
 */
Matrix4.prototype.set = function(src) {
  var i, s, d;

  s = src.elements;
  d = this.elements;

  if (s === d) {
    return;
  }
    
  for (i = 0; i < 16; ++i) {
    d[i] = s[i];
  }

  return this;
};

/**
 * Multiply the matrix from the right.
 * @param other The multiply matrix
 * @return this
 */
Matrix4.prototype.concat = function(other) {
  var i, e, a, b, ai0, ai1, ai2, ai3;
  
  // Calculate e = a * b
  e = this.elements;
  a = this.elements;
  b = other.elements;
  
  // If e equals b, copy b to temporary matrix.
  if (e === b) {
    b = new Float32Array(16);
    for (i = 0; i < 16; ++i) {
      b[i] = e[i];
    }
  }
  
  for (i = 0; i < 4; i++) {
    ai0=a[i];  ai1=a[i+4];  ai2=a[i+8];  ai3=a[i+12];
    e[i]    = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2]  + ai3 * b[3];
    e[i+4]  = ai0 * b[4]  + ai1 * b[5]  + ai2 * b[6]  + ai3 * b[7];
    e[i+8]  = ai0 * b[8]  + ai1 * b[9]  + ai2 * b[10] + ai3 * b[11];
    e[i+12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
  }
  
  return this;
};
Matrix4.prototype.multiply = Matrix4.prototype.concat;

/**
 * Multiply the three-dimensional vector.
 * @param pos  The multiply vector
 * @return The result of multiplication(Float32Array)
 */
Matrix4.prototype.multiplyVector3 = function(pos) {
  var e = this.elements;
  var p = pos.elements;
  var v = new Vector3();
  var result = v.elements;

  result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[ 8] + e[11];
  result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[ 9] + e[12];
  result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + e[13];

  return v;
};

/**
 * Multiply the four-dimensional vector.
 * @param pos  The multiply vector
 * @return The result of multiplication(Float32Array)
 */
Matrix4.prototype.multiplyVector4 = function(pos) {
  var e = this.elements;
  var p = pos.elements;
  var v = new Vector4();
  var result = v.elements;

  result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[ 8] + p[3] * e[12];
  result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[ 9] + p[3] * e[13];
  result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + p[3] * e[14];
  result[3] = p[0] * e[3] + p[1] * e[7] + p[2] * e[11] + p[3] * e[15];

  return v;
};

/**
 * Transpose the matrix.
 * @return this
 */
Matrix4.prototype.transpose = function() {
  var e, t;

  e = this.elements;

  t = e[ 1];  e[ 1] = e[ 4];  e[ 4] = t;
  t = e[ 2];  e[ 2] = e[ 8];  e[ 8] = t;
  t = e[ 3];  e[ 3] = e[12];  e[12] = t;
  t = e[ 6];  e[ 6] = e[ 9];  e[ 9] = t;
  t = e[ 7];  e[ 7] = e[13];  e[13] = t;
  t = e[11];  e[11] = e[14];  e[14] = t;

  return this;
};

/**
 * Calculate the inverse matrix of specified matrix, and set to this.
 * @param other The source matrix
 * @return this
 */
Matrix4.prototype.setInverseOf = function(other) {
  var i, s, d, inv, det;

  s = other.elements;
  d = this.elements;
  inv = new Float32Array(16);

  inv[0]  =   s[5]*s[10]*s[15] - s[5] *s[11]*s[14] - s[9] *s[6]*s[15]
            + s[9]*s[7] *s[14] + s[13]*s[6] *s[11] - s[13]*s[7]*s[10];
  inv[4]  = - s[4]*s[10]*s[15] + s[4] *s[11]*s[14] + s[8] *s[6]*s[15]
            - s[8]*s[7] *s[14] - s[12]*s[6] *s[11] + s[12]*s[7]*s[10];
  inv[8]  =   s[4]*s[9] *s[15] - s[4] *s[11]*s[13] - s[8] *s[5]*s[15]
            + s[8]*s[7] *s[13] + s[12]*s[5] *s[11] - s[12]*s[7]*s[9];
  inv[12] = - s[4]*s[9] *s[14] + s[4] *s[10]*s[13] + s[8] *s[5]*s[14]
            - s[8]*s[6] *s[13] - s[12]*s[5] *s[10] + s[12]*s[6]*s[9];

  inv[1]  = - s[1]*s[10]*s[15] + s[1] *s[11]*s[14] + s[9] *s[2]*s[15]
            - s[9]*s[3] *s[14] - s[13]*s[2] *s[11] + s[13]*s[3]*s[10];
  inv[5]  =   s[0]*s[10]*s[15] - s[0] *s[11]*s[14] - s[8] *s[2]*s[15]
            + s[8]*s[3] *s[14] + s[12]*s[2] *s[11] - s[12]*s[3]*s[10];
  inv[9]  = - s[0]*s[9] *s[15] + s[0] *s[11]*s[13] + s[8] *s[1]*s[15]
            - s[8]*s[3] *s[13] - s[12]*s[1] *s[11] + s[12]*s[3]*s[9];
  inv[13] =   s[0]*s[9] *s[14] - s[0] *s[10]*s[13] - s[8] *s[1]*s[14]
            + s[8]*s[2] *s[13] + s[12]*s[1] *s[10] - s[12]*s[2]*s[9];

  inv[2]  =   s[1]*s[6]*s[15] - s[1] *s[7]*s[14] - s[5] *s[2]*s[15]
            + s[5]*s[3]*s[14] + s[13]*s[2]*s[7]  - s[13]*s[3]*s[6];
  inv[6]  = - s[0]*s[6]*s[15] + s[0] *s[7]*s[14] + s[4] *s[2]*s[15]
            - s[4]*s[3]*s[14] - s[12]*s[2]*s[7]  + s[12]*s[3]*s[6];
  inv[10] =   s[0]*s[5]*s[15] - s[0] *s[7]*s[13] - s[4] *s[1]*s[15]
            + s[4]*s[3]*s[13] + s[12]*s[1]*s[7]  - s[12]*s[3]*s[5];
  inv[14] = - s[0]*s[5]*s[14] + s[0] *s[6]*s[13] + s[4] *s[1]*s[14]
            - s[4]*s[2]*s[13] - s[12]*s[1]*s[6]  + s[12]*s[2]*s[5];

  inv[3]  = - s[1]*s[6]*s[11] + s[1]*s[7]*s[10] + s[5]*s[2]*s[11]
            - s[5]*s[3]*s[10] - s[9]*s[2]*s[7]  + s[9]*s[3]*s[6];
  inv[7]  =   s[0]*s[6]*s[11] - s[0]*s[7]*s[10] - s[4]*s[2]*s[11]
            + s[4]*s[3]*s[10] + s[8]*s[2]*s[7]  - s[8]*s[3]*s[6];
  inv[11] = - s[0]*s[5]*s[11] + s[0]*s[7]*s[9]  + s[4]*s[1]*s[11]
            - s[4]*s[3]*s[9]  - s[8]*s[1]*s[7]  + s[8]*s[3]*s[5];
  inv[15] =   s[0]*s[5]*s[10] - s[0]*s[6]*s[9]  - s[4]*s[1]*s[10]
            + s[4]*s[2]*s[9]  + s[8]*s[1]*s[6]  - s[8]*s[2]*s[5];

  det = s[0]*inv[0] + s[1]*inv[4] + s[2]*inv[8] + s[3]*inv[12];
  if (det === 0) {
    return this;
  }

  det = 1 / det;
  for (i = 0; i < 16; i++) {
    d[i] = inv[i] * det;
  }

  return this;
};

/**
 * Calculate the inverse matrix of this, and set to this.
 * @return this
 */
Matrix4.prototype.invert = function() {
  return this.setInverseOf(this);
};

/**
 * Set the orthographic projection matrix.
 * @param left The coordinate of the left of clipping plane.
 * @param right The coordinate of the right of clipping plane.
 * @param bottom The coordinate of the bottom of clipping plane.
 * @param top The coordinate of the top top clipping plane.
 * @param near The distances to the nearer depth clipping plane. This value is minus if the plane is to be behind the viewer.
 * @param far The distances to the farther depth clipping plane. This value is minus if the plane is to be behind the viewer.
 * @return this
 */
Matrix4.prototype.setOrtho = function(left, right, bottom, top, near, far) {
  var e, rw, rh, rd;

  if (left === right || bottom === top || near === far) {
    throw 'null frustum';
  }

  rw = 1 / (right - left);
  rh = 1 / (top - bottom);
  rd = 1 / (far - near);

  e = this.elements;

  e[0]  = 2 * rw;
  e[1]  = 0;
  e[2]  = 0;
  e[3]  = 0;

  e[4]  = 0;
  e[5]  = 2 * rh;
  e[6]  = 0;
  e[7]  = 0;

  e[8]  = 0;
  e[9]  = 0;
  e[10] = -2 * rd;
  e[11] = 0;

  e[12] = -(right + left) * rw;
  e[13] = -(top + bottom) * rh;
  e[14] = -(far + near) * rd;
  e[15] = 1;

  return this;
};

/**
 * Multiply the orthographic projection matrix from the right.
 * @param left The coordinate of the left of clipping plane.
 * @param right The coordinate of the right of clipping plane.
 * @param bottom The coordinate of the bottom of clipping plane.
 * @param top The coordinate of the top top clipping plane.
 * @param near The distances to the nearer depth clipping plane. This value is minus if the plane is to be behind the viewer.
 * @param far The distances to the farther depth clipping plane. This value is minus if the plane is to be behind the viewer.
 * @return this
 */
Matrix4.prototype.ortho = function(left, right, bottom, top, near, far) {
  return this.concat(new Matrix4().setOrtho(left, right, bottom, top, near, far));
};

/**
 * Set the perspective projection matrix.
 * @param left The coordinate of the left of clipping plane.
 * @param right The coordinate of the right of clipping plane.
 * @param bottom The coordinate of the bottom of clipping plane.
 * @param top The coordinate of the top top clipping plane.
 * @param near The distances to the nearer depth clipping plane. This value must be plus value.
 * @param far The distances to the farther depth clipping plane. This value must be plus value.
 * @return this
 */
Matrix4.prototype.setFrustum = function(left, right, bottom, top, near, far) {
  var e, rw, rh, rd;

  if (left === right || top === bottom || near === far) {
    throw 'null frustum';
  }
  if (near <= 0) {
    throw 'near <= 0';
  }
  if (far <= 0) {
    throw 'far <= 0';
  }

  rw = 1 / (right - left);
  rh = 1 / (top - bottom);
  rd = 1 / (far - near);

  e = this.elements;

  e[ 0] = 2 * near * rw;
  e[ 1] = 0;
  e[ 2] = 0;
  e[ 3] = 0;

  e[ 4] = 0;
  e[ 5] = 2 * near * rh;
  e[ 6] = 0;
  e[ 7] = 0;

  e[ 8] = (right + left) * rw;
  e[ 9] = (top + bottom) * rh;
  e[10] = -(far + near) * rd;
  e[11] = -1;

  e[12] = 0;
  e[13] = 0;
  e[14] = -2 * near * far * rd;
  e[15] = 0;

  return this;
};

/**
 * Multiply the perspective projection matrix from the right.
 * @param left The coordinate of the left of clipping plane.
 * @param right The coordinate of the right of clipping plane.
 * @param bottom The coordinate of the bottom of clipping plane.
 * @param top The coordinate of the top top clipping plane.
 * @param near The distances to the nearer depth clipping plane. This value must be plus value.
 * @param far The distances to the farther depth clipping plane. This value must be plus value.
 * @return this
 */
Matrix4.prototype.frustum = function(left, right, bottom, top, near, far) {
  return this.concat(new Matrix4().setFrustum(left, right, bottom, top, near, far));
};

/**
 * Set the perspective projection matrix by fovy and aspect.
 * @param fovy The angle between the upper and lower sides of the frustum.
 * @param aspect The aspect ratio of the frustum. (width/height)
 * @param near The distances to the nearer depth clipping plane. This value must be plus value.
 * @param far The distances to the farther depth clipping plane. This value must be plus value.
 * @return this
 */
Matrix4.prototype.setPerspective = function(fovy, aspect, near, far) {
  var e, rd, s, ct;

  if (near === far || aspect === 0) {
    throw 'null frustum';
  }
  if (near <= 0) {
    throw 'near <= 0';
  }
  if (far <= 0) {
    throw 'far <= 0';
  }

  fovy = Math.PI * fovy / 180 / 2;
  s = Math.sin(fovy);
  if (s === 0) {
    throw 'null frustum';
  }

  rd = 1 / (far - near);
  ct = Math.cos(fovy) / s;

  e = this.elements;

  e[0]  = ct / aspect;
  e[1]  = 0;
  e[2]  = 0;
  e[3]  = 0;

  e[4]  = 0;
  e[5]  = ct;
  e[6]  = 0;
  e[7]  = 0;

  e[8]  = 0;
  e[9]  = 0;
  e[10] = -(far + near) * rd;
  e[11] = -1;

  e[12] = 0;
  e[13] = 0;
  e[14] = -2 * near * far * rd;
  e[15] = 0;

  return this;
};

/**
 * Multiply the perspective projection matrix from the right.
 * @param fovy The angle between the upper and lower sides of the frustum.
 * @param aspect The aspect ratio of the frustum. (width/height)
 * @param near The distances to the nearer depth clipping plane. This value must be plus value.
 * @param far The distances to the farther depth clipping plane. This value must be plus value.
 * @return this
 */
Matrix4.prototype.perspective = function(fovy, aspect, near, far) {
  return this.concat(new Matrix4().setPerspective(fovy, aspect, near, far));
};

/**
 * Set the matrix for scaling.
 * @param x The scale factor along the X axis
 * @param y The scale factor along the Y axis
 * @param z The scale factor along the Z axis
 * @return this
 */
Matrix4.prototype.setScale = function(x, y, z) {
  var e = this.elements;
  e[0] = x;  e[4] = 0;  e[8]  = 0;  e[12] = 0;
  e[1] = 0;  e[5] = y;  e[9]  = 0;  e[13] = 0;
  e[2] = 0;  e[6] = 0;  e[10] = z;  e[14] = 0;
  e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
  return this;
};

/**
 * Multiply the matrix for scaling from the right.
 * @param x The scale factor along the X axis
 * @param y The scale factor along the Y axis
 * @param z The scale factor along the Z axis
 * @return this
 */
Matrix4.prototype.scale = function(x, y, z) {
  var e = this.elements;
  e[0] *= x;  e[4] *= y;  e[8]  *= z;
  e[1] *= x;  e[5] *= y;  e[9]  *= z;
  e[2] *= x;  e[6] *= y;  e[10] *= z;
  e[3] *= x;  e[7] *= y;  e[11] *= z;
  return this;
};

/**
 * Set the matrix for translation.
 * @param x The X value of a translation.
 * @param y The Y value of a translation.
 * @param z The Z value of a translation.
 * @return this
 */
Matrix4.prototype.setTranslate = function(x, y, z) {
  var e = this.elements;
  e[0] = 1;  e[4] = 0;  e[8]  = 0;  e[12] = x;
  e[1] = 0;  e[5] = 1;  e[9]  = 0;  e[13] = y;
  e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = z;
  e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
  return this;
};

/**
 * Multiply the matrix for translation from the right.
 * @param x The X value of a translation.
 * @param y The Y value of a translation.
 * @param z The Z value of a translation.
 * @return this
 */
Matrix4.prototype.translate = function(x, y, z) {
  var e = this.elements;
  e[12] += e[0] * x + e[4] * y + e[8]  * z;
  e[13] += e[1] * x + e[5] * y + e[9]  * z;
  e[14] += e[2] * x + e[6] * y + e[10] * z;
  e[15] += e[3] * x + e[7] * y + e[11] * z;
  return this;
};

/**
 * Set the matrix for rotation.
 * The vector of rotation axis may not be normalized.
 * @param angle The angle of rotation (degrees)
 * @param x The X coordinate of vector of rotation axis.
 * @param y The Y coordinate of vector of rotation axis.
 * @param z The Z coordinate of vector of rotation axis.
 * @return this
 */
Matrix4.prototype.setRotate = function(angle, x, y, z) {
  var e, s, c, len, rlen, nc, xy, yz, zx, xs, ys, zs;

  angle = Math.PI * angle / 180;
  e = this.elements;

  s = Math.sin(angle);
  c = Math.cos(angle);

  if (0 !== x && 0 === y && 0 === z) {
    // Rotation around X axis
    if (x < 0) {
      s = -s;
    }
    e[0] = 1;  e[4] = 0;  e[ 8] = 0;  e[12] = 0;
    e[1] = 0;  e[5] = c;  e[ 9] =-s;  e[13] = 0;
    e[2] = 0;  e[6] = s;  e[10] = c;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
  } else if (0 === x && 0 !== y && 0 === z) {
    // Rotation around Y axis
    if (y < 0) {
      s = -s;
    }
    e[0] = c;  e[4] = 0;  e[ 8] = s;  e[12] = 0;
    e[1] = 0;  e[5] = 1;  e[ 9] = 0;  e[13] = 0;
    e[2] =-s;  e[6] = 0;  e[10] = c;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
  } else if (0 === x && 0 === y && 0 !== z) {
    // Rotation around Z axis
    if (z < 0) {
      s = -s;
    }
    e[0] = c;  e[4] =-s;  e[ 8] = 0;  e[12] = 0;
    e[1] = s;  e[5] = c;  e[ 9] = 0;  e[13] = 0;
    e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
  } else {
    // Rotation around another axis
    len = Math.sqrt(x*x + y*y + z*z);
    if (len !== 1) {
      rlen = 1 / len;
      x *= rlen;
      y *= rlen;
      z *= rlen;
    }
    nc = 1 - c;
    xy = x * y;
    yz = y * z;
    zx = z * x;
    xs = x * s;
    ys = y * s;
    zs = z * s;

    e[ 0] = x*x*nc +  c;
    e[ 1] = xy *nc + zs;
    e[ 2] = zx *nc - ys;
    e[ 3] = 0;

    e[ 4] = xy *nc - zs;
    e[ 5] = y*y*nc +  c;
    e[ 6] = yz *nc + xs;
    e[ 7] = 0;

    e[ 8] = zx *nc + ys;
    e[ 9] = yz *nc - xs;
    e[10] = z*z*nc +  c;
    e[11] = 0;

    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;
  }

  return this;
};

/**
 * Multiply the matrix for rotation from the right.
 * The vector of rotation axis may not be normalized.
 * @param angle The angle of rotation (degrees)
 * @param x The X coordinate of vector of rotation axis.
 * @param y The Y coordinate of vector of rotation axis.
 * @param z The Z coordinate of vector of rotation axis.
 * @return this
 */
Matrix4.prototype.rotate = function(angle, x, y, z) {
  return this.concat(new Matrix4().setRotate(angle, x, y, z));
};

/**
 * Set the viewing matrix.
 * @param eyeX, eyeY, eyeZ The position of the eye point.
 * @param centerX, centerY, centerZ The position of the reference point.
 * @param upX, upY, upZ The direction of the up vector.
 * @return this
 */
Matrix4.prototype.setLookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
  var e, fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;

  fx = centerX - eyeX;
  fy = centerY - eyeY;
  fz = centerZ - eyeZ;

  // Normalize f.
  rlf = 1 / Math.sqrt(fx*fx + fy*fy + fz*fz);
  fx *= rlf;
  fy *= rlf;
  fz *= rlf;

  // Calculate cross product of f and up.
  sx = fy * upZ - fz * upY;
  sy = fz * upX - fx * upZ;
  sz = fx * upY - fy * upX;

  // Normalize s.
  rls = 1 / Math.sqrt(sx*sx + sy*sy + sz*sz);
  sx *= rls;
  sy *= rls;
  sz *= rls;

  // Calculate cross product of s and f.
  ux = sy * fz - sz * fy;
  uy = sz * fx - sx * fz;
  uz = sx * fy - sy * fx;

  // Set to this.
  e = this.elements;
  e[0] = sx;
  e[1] = ux;
  e[2] = -fx;
  e[3] = 0;

  e[4] = sy;
  e[5] = uy;
  e[6] = -fy;
  e[7] = 0;

  e[8] = sz;
  e[9] = uz;
  e[10] = -fz;
  e[11] = 0;

  e[12] = 0;
  e[13] = 0;
  e[14] = 0;
  e[15] = 1;

  // Translate.
  return this.translate(-eyeX, -eyeY, -eyeZ);
};

/**
 * Multiply the viewing matrix from the right.
 * @param eyeX, eyeY, eyeZ The position of the eye point.
 * @param centerX, centerY, centerZ The position of the reference point.
 * @param upX, upY, upZ The direction of the up vector.
 * @return this
 */
Matrix4.prototype.lookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
  return this.concat(new Matrix4().setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ));
};

/**
 * Multiply the matrix for project vertex to plane from the right.
 * @param plane The array[A, B, C, D] of the equation of plane "Ax + By + Cz + D = 0".
 * @param light The array which stored coordinates of the light. if light[3]=0, treated as parallel light.
 * @return this
 */
Matrix4.prototype.dropShadow = function(plane, light) {
  var mat = new Matrix4();
  var e = mat.elements;

  var dot = plane[0] * light[0] + plane[1] * light[1] + plane[2] * light[2] + plane[3] * light[3];

  e[ 0] = dot - light[0] * plane[0];
  e[ 1] =     - light[1] * plane[0];
  e[ 2] =     - light[2] * plane[0];
  e[ 3] =     - light[3] * plane[0];

  e[ 4] =     - light[0] * plane[1];
  e[ 5] = dot - light[1] * plane[1];
  e[ 6] =     - light[2] * plane[1];
  e[ 7] =     - light[3] * plane[1];

  e[ 8] =     - light[0] * plane[2];
  e[ 9] =     - light[1] * plane[2];
  e[10] = dot - light[2] * plane[2];
  e[11] =     - light[3] * plane[2];

  e[12] =     - light[0] * plane[3];
  e[13] =     - light[1] * plane[3];
  e[14] =     - light[2] * plane[3];
  e[15] = dot - light[3] * plane[3];

  return this.concat(mat);
}

/**
 * Multiply the matrix for project vertex to plane from the right.(Projected by parallel light.)
 * @param normX, normY, normZ The normal vector of the plane.(Not necessary to be normalized.)
 * @param planeX, planeY, planeZ The coordinate of arbitrary points on a plane.
 * @param lightX, lightY, lightZ The vector of the direction of light.(Not necessary to be normalized.)
 * @return this
 */
Matrix4.prototype.dropShadowDirectionally = function(normX, normY, normZ, planeX, planeY, planeZ, lightX, lightY, lightZ) {
  var a = planeX * normX + planeY * normY + planeZ * normZ;
  return this.dropShadow([normX, normY, normZ, -a], [lightX, lightY, lightZ, 0]);
};

/**
 * Constructor of Vector3
 * If opt_src is specified, new vector is initialized by opt_src.
 * @param opt_src source vector(option)
 */
var Vector3 = function(opt_src) {
  var v = new Float32Array(3);
  if (opt_src && typeof opt_src === 'object') {
    v[0] = opt_src[0]; v[1] = opt_src[1]; v[2] = opt_src[2];
  } 
  this.elements = v;
}

/**
  * Normalize.
  * @return this
  */
Vector3.prototype.normalize = function() {
  var v = this.elements;
  var c = v[0], d = v[1], e = v[2], g = Math.sqrt(c*c+d*d+e*e);
  if(g){
    if(g == 1)
        return this;
   } else {
     v[0] = 0; v[1] = 0; v[2] = 0;
     return this;
   }
   g = 1/g;
   v[0] = c*g; v[1] = d*g; v[2] = e*g;
   return this;
};

/**
 * Constructor of Vector4
 * If opt_src is specified, new vector is initialized by opt_src.
 * @param opt_src source vector(option)
 */
var Vector4 = function(opt_src) {
  var v = new Float32Array(4);
  if (opt_src && typeof opt_src === 'object') {
    v[0] = opt_src[0]; v[1] = opt_src[1]; v[2] = opt_src[2]; v[3] = opt_src[3];
  } 
  this.elements = v;
}



/***********************************cuon-utils**************************/

//cuon-utils.js (c) 2012 kanda and matsuda
/**
 * Create a program object and make current
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return true, if the program object was created and successfully made current 
 */
function initShaders(gl, vshader, fshader) {
  var program = createProgram(gl, vshader, fshader);
  if (!program) {
    console.log('Failed to create program');
    return false;
  }

  gl.useProgram(program);
  gl.program = program;

  return true;
}

/**
 * Create the linked program object
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return created program object, or null if the creation has failed
 */
function createProgram(gl, vshader, fshader) {
  // Create shader object
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // Create a program object
  var program = gl.createProgram();
  if (!program) {
    return null;
  }

  // Attach the shader objects
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link the program object
  gl.linkProgram(program);

  // Check the result of linking
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    var error = gl.getProgramInfoLog(program);
    console.log('Failed to link program: ' + error);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  return program;
}

/**
 * Create a shader object
 * @param gl GL context
 * @param type the type of the shader object to be created
 * @param source shader program (string)
 * @return created shader object, or null if the creation has failed.
 */
function loadShader(gl, type, source) {
  // Create shader object
  var shader = gl.createShader(type);
  if (shader == null) {
    console.log('unable to create shader');
    return null;
  }

  // Set the shader program
  gl.shaderSource(shader, source);

  // Compile the shader
  gl.compileShader(shader);

  // Check the result of compilation
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    var error = gl.getShaderInfoLog(shader);
    console.log('Failed to compile shader: ' + error);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/** 
 * Initialize and get the rendering for WebGL
 * @param canvas <cavnas> element
 * @param opt_debug flag to initialize the context for debugging
 * @return the rendering context for WebGL
 */
function getWebGLContext(canvas, opt_debug) {
  // Get the rendering context for WebGL
  var gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) return null;

  // if opt_debug is explicitly false, create the context for debugging
  if (arguments.length < 2 || opt_debug) {
    gl = WebGLDebugUtils.makeDebugContext(gl);
  }

  return gl;
}


/**
 * 1.0颜色转换为255颜色
 * @param glColors
 * @returns
 */
function colorsTo255(glColors){
	var colors =[]
	for(var i=0;i<glColors.length;i++){
		var glColor =glColors[i];
		var color =[];
		for(var j=0;j<glColor.length;j++){
			if(j<3){
				var value = Math.ceil(glColor[j]*255)
				color[j]=value;
			}else if(j==3){
				color[j]=glColor[j];
			}
		}
		colors[i]=color;
	}
	return colors;
}












