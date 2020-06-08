<script>
	import TimelinePast from './TimelinePast.svelte';

	let distanceBLines = 'calc((95vh - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';
	
	export let pagetitleText;
	export let rotate;
</script>


<TimelinePast></TimelinePast>


<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	<div class="text">Since 1880<!-- , in 140 years,--> Earth’s average global temperature has increased by&nbsp;1,1&nbsp;-&nbsp;1,3°C.</div>
</div>



<div class="tempMeter">
	<div class="temperature">
		<span class="tempnumber text">1,2°C</span>
	</div>
</div>

<div class="verticalLine1"></div>

<div class="arrow text">&uarr;</div>




<style>

	.pagetitle {
	    position: absolute;
	    /*top: 100px;
	    height: 80vh;
	    right: 20px;*/
	    font-size: 30px;
	    font-family: meadow;
	    z-index: 9;

	    pointer-events: none;

	    /*writing-mode: vertical-rl;
		text-orientation: mixed;*/


		bottom: 0vh;
		left: 0px;
		right: 0px;
		width: 100vw;
		text-align: center;

		/*background-color: yellow;*/

		bottom: 50vh;
	}

	.tempMeter {
		position: absolute;
		top: calc((100vw / 16) - 8px);   /* added the -8px just to push it up a bit  */
		left: calc(100vw / 16);
		right: calc(100vw / 16);
		height: calc(((95vh - 1px) / 9) - ((100vw / 16) * 2) - 2px);
		border: 1px solid black;
	}

	.temperature {
		position: absolute;
		background-color: rgb(70,70,70);
		background-color: blue;
		height: 100%;
		top: 0%;
		left: 0%;
		width: calc((100% / 15) * 12);
	}
	.tempnumber {
		position: absolute;
		right: 2.5px;
		top: 2.5px;
		color: white !important;
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
	.pagetitle .text {
		font-size: 6vw;
	}
	.arrow {
		width: calc(100vw / 16);
		text-align: center;
	}


</style>