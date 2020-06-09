<script>
	import TimelinePast from './TimelinePast.svelte';
	import Meter from './topMeter.svelte';

	let distanceBLines = 'calc((95vh - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';
	
	export let pagetitleText;
	export let rotate;
</script>




<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	<div class="text">Swipe<br>&uarr;</div>
</div>

<div class="activedot activedot1">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






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
	.text {
		color: rgb(70,70,70);
	}
	.pagetitle .text {
		font-size: 6vw;
	}



</style>