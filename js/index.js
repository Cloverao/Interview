	$(function(){
		var iconArray = [{
			title: "deImg deImg01",
			deImg : "img/conect.png",
			desc:"新增客户个数"
		},{
			title: "deImg deImg02",
			deImg : "img/mingpian.png",
			desc:"新增联系人"
		},{
			title: "deImg deImg03",
			deImg : "img/miaozhun.png",
			desc:"新增商机数"
		},{
			title: "deImg deImg04",
			deImg : "img/xsjd.png",
			desc:"阶段变化的商机"
		},{
			title: "deImg deImg05",
			deImg : "img/khda.png",
			desc:"拜访客户"
		},{
			title: "deImg deImg06",
			deImg : "img/xs.png",
			desc:"新增销售记录"
		}];
		
		
		function loadIcon(){
			for(var i = 0;i<iconArray.length;i++){
				$(".deIcno .deImg").each(function(){
					var imgClass = $(this).attr("class");
					if(imgClass == iconArray[i].title){
						$(this).css("background","url("+iconArray[i].deImg+")");
					}
					
				});
			}
		}
		
		loadIcon();
	})