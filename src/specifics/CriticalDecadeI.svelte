<script>
	import TimelinePast from './TimelinePast.svelte';
	import TimelineFuture from './TimelineFuture.svelte';
	export let pagetitleText;
	export let rotate;


	let distanceBLines = 'calc((95vh - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';

	let tempWidthA = 'calc((100vw - (100vw / 8)) / 15 * 12)';
	let tempWidthB = 'calc(((100vw - (100vw / 8)) / 15 * 10) / 3 * 2)';


	let firstText = true;
	let secondText = false;
	let thirdText = false;

	let firstLines = true;
	let secondLines = false;
	let thirdLines = false;

	const togglesecondSetup = () => {
		firstText = false;
		secondText = true;

		firstLines = false;
		secondLines = true;
	}

	const togglethirdSetup = () => {
		secondText = false;
		thirdText = true;

		//secondLines = false;
		thirdLines = true;
	}


	


</script>

{#if firstText}
	<TimelinePast></TimelinePast>
{/if}


<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	{#if firstText}
 		<div on:click={togglesecondSetup} class="text">Since 1880<!-- , in 140 years,--> Earth’s average global temperature has increased by&nbsp;1,1&nbsp;-&nbsp;1,3°C.</div>
 	{/if}
 	{#if secondText}
 		<div on:click={togglethirdSetup} class="text">“Two-thirds of the warming has occurred since 1975”, in the last 45&nbsp;years.<sub>1</sub></div>
 	{/if}
 	{#if thirdText}
 		<div href="#page5" class="text">The Paris Agreement (which has been critisized for not being radical enough) aims to limit warming to +&nbsp;1,5°C by&nbsp;2100.</div>
 	{/if}
</div>






<div class="tempMeter">
	<div class="temperature" style="width: {tempWidthA};">
		<span class="tempnumber text">1,2°C</span>
	</div>
</div>


{#if firstLines}
	<div class="verticalLine fromTop" style="left: calc({marginSides} + {tempWidthA}); height: calc({distanceBLines} * 9);"></div>
{/if}
{#if secondLines}
	<div class="verticalLine fromTop" style="left: calc({marginSides} + {tempWidthB}); height: calc({distanceBLines} * 4.5);"></div>
	<div class="horizontalLine" style="left: calc({marginSides} + {tempWidthB}); width: calc({tempWidthA} - {tempWidthB}); top: calc({distanceBLines} * 4.5);"></div>
	<div class="verticalLine" style="left: calc({marginSides} + {tempWidthA}); top: calc({distanceBLines} * 4.5); height: calc({distanceBLines} * 4.5);"></div>
	{#if secondText}
		<div class="text years left line45">1975</div>
		<div class="text years left line0">2020</div>
	{/if}
	<div class="line left line45"></div>
{/if}
{#if thirdLines}
	<div class="tempMeter">
		<div class="temperature" style="width: 100%; background-color: rgba(0,0,0,0) !important;">
			<span class="tempnumber text">1,5°C</span>
		</div>
	</div>

	<TimelineFuture></TimelineFuture>

	<div class="verticalLine fromTop" style="right: {marginSides}; height: calc({distanceBLines} * 9);"></div>
{/if}

<div class="arrow text" style="width: {marginSides};">&uarr;</div>












<div class="activedot activedot4"></div>
<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>




<style>

	.temperature {
		position: absolute;
		height: 100%;
		top: 0%;
		left: 0%;
		background-color: lightgrey;
	}


	.tempnumber {
		position: absolute;
		right: 2.5px;
		top: 2.5px;
	}


	.verticalLine {
		position: absolute;
		border-right: 1px dotted blue;
		width: 0px;
	}
	.fromTop {top: 0vh;}

	.horizontalLine {
		position: absolute;
		border-top: 1px dotted blue;
		height: 0px;
	}


	.text {color: blue;}
	.arrow {text-align: center;}
	.line {background-color: blue;}


</style>