<template>
 <div class="content">
 	<div class="showSelected">
 		<input type="text"/>
 		
 		<img src="../assets/add.png"/>
 	</div>
 	
 	<div class="select">
	 	<div class="secrch">
	 		<input type="text" placeholder="搜索"/>
	 		<img src="../assets/searchIcon.png"/>
	 	</div>
	 	<div class="options">
	 		<div class="option">
	 			<input type="checkbox"  class="cb-label"/>
	 			<label for="checkbox" class="cb-label"></label>
	 			<span>变更中</span>
	 		</div>
	 		<div class="option">
	 			<input type="checkbox"  class="check"/>
	 			<span>未生效</span>
	 		</div>
	 		<div class="option">
	 			<input type="checkbox"  class="check"/>
	 			<span>作废</span>
	 		</div>
	 		<div class="option">
	 			<input type="checkbox"  class="check"/>
	 			<span>正常</span>
	 		</div>
	 		<div class="option">
	 			<input type="checkbox" class="check"/>
	 			<span>审核中</span>
	 		</div>
	 	</div>
	 </div>
 </div>
<!-- -->
</template>

<script>
	$(function(){
		$(".cb-label").each(function(){
			$(this).click(function(){
				if($(this).is(":checked")){
					//找到上面的标签
					//获得选中标签后面的文字
					var text1 = $(this).next().text();
					//获得需要添加的标签
					$(".showSelected input");
					console.log($(".showSelected input"));
				  var input1 = $(".showSelected input");
				   //如果选中的大于1的话创建一个数组将之前选中的值存放在数组中
				  var hisArray = [];
				  hisArray.push(text1);
				  console.log(hisArray);
				  //将选中的文字添加到input1中
				  input1.append().val(hisArray);
				  
				 
				}
			});
		});
	})
export default {
  name: 'HelloWorld',
  data () {
    return {

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content .showSelected input{
	border-radius: 5px;
	border:1px solid #bfbfbf;
	height:30px;
	width:300px;
	color:#3E97EB;
}
.content .showSelected input:value{
	color:#fff;
	background:#3E97EB;
}
.content .showSelected img{
	width:25px;
	height:25px;
	position:absolute;
	top:64px;
	right:613px;
}
.content .select{
	width:300px;
	height:240px;
	border-radius: 5px;
	border:1px solid #bfbfbf;
	margin:0 auto;
}
.content .select .secrch{
	width:100%;
	height:50px;
	background:#f8f8f8;
}
.content .select .secrch input{
	width:240px;
	height:30px;
	border-radius: 30px;
	border:1px solid #BFBFBF;
	margin:9px auto;
	text-indent: 40px;
}

.content .select .secrch img{
	position:relative;
	top:6px;
	left:-240px;
}
.select{
		box-shadow:0px 2px 5px 1px #BFBFBF;
		border:none;
}
.select .options{
	float:left;
	text-align: left;

}
.select .options .option{
	width:100%;
}
.select .options .option input{
	width:18px;
	height:18px;
	margin:10px 20px;
}
.select .options .option input[type="checkbox"]:checked::after{
	width:18px;
	height:18px;
	margin:10px 20px;
	background: #3e97eb;
	border:1px solid #3e97eb;
	color:#3E97EB;
}
.select .options .option span{
	top:-3px;
	position:relative;
}
</style>
