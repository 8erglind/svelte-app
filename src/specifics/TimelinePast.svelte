<script></script>



<div class="line left line10"></div>
<div class="line left line20"></div>
<div class="line left line30"></div>
<div class="line left line40"></div>
<div class="line left line50"></div>
<div class="line left line60"></div>
<div class="line left line70"></div>
<div class="line left line80"></div>

<div class="text years left line0">2020</div>
<div class="text years left line10">2010</div>
<div class="text years left line20">2000</div>
<div class="text years left line30">1990</div>
<div class="text years left line40">1980</div>
<div class="text years left line50">1970</div>
<div class="text years left line60">1960</div>
<div class="text years left line70">1950</div>
<div class="text years left line80">1940</div>



<style>
	.line {
		position: absolute;
		height: 1px;
    	background-color: black;
    	width: calc(100vw / 16);
	}
	.years {
		position: absolute;
		width: calc(100vw / 16);
		text-align: center; 
	}
	.left {left: 0px;}

	.line0 {bottom: 0vh;}   /*   why not 5vh???*??   */
	.line10 {bottom: calc((95vh - 1px) / 9 * 1);}
	.line20 {bottom: calc((95vh - 1px) / 9 * 2);}
	.line30 {bottom: calc((95vh - 1px) / 9 * 3);}
	.line40 {bottom: calc((95vh - 1px) / 9 * 4);}
	.line50 {bottom: calc((95vh - 1px) / 9 * 5);}
	.line60 {bottom: calc((95vh - 1px) / 9 * 6);}
	.line70 {bottom: calc((95vh - 1px) / 9 * 7);}
	.line80 {bottom: calc((95vh - 1px) / 9 * 8);}

</style>