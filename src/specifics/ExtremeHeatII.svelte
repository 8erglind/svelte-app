<script>
	import TimelinePast from './TimelinePast.svelte';

	let distanceBLines = 'calc((95vh - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';
	
	export let pagetitleText;
	export let rotate;
</script>





<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	<div class="text"></div>
</div>

<div class="activedot activedot3"></div>
<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>



<!--<div class="tempMeter">
	<div class="temperature">
		<span class="tempnumber text">1,2°C</span>
	</div>
</div>

<div class="verticalLine1"></div>

<div class="arrow text">&uarr;</div>-->




<style>

	.temperature {
		position: absolute;
		background-color: rgb(70,70,70);
		background-color: lightgrey;
		height: 100%;
		top: 0%;
		left: 0%;
		width: calc((100% / 15) * 12);
	}
	.tempnumber {
		position: absolute;
		right: 2.5px;
		top: 2.5px;
		/*color: white !important;*/
	}

	.verticalLine1 {
		position: absolute;
		top: 0vh;
		height: 95vh;
		width: 1px;
		border-right: 1px dotted blue;
		left: calc((100vw / 16) + (((100vw - ((100vw / 16) * 2)) / 15) * 12) - 2px - 0.5px);
	}
	.text {
		color: blue;
	}
	.arrow {
		width: calc(100vw / 16);
		text-align: center;
	}


</style>