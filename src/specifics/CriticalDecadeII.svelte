<script>
	import TimelinePast from './TimelinePast.svelte';
	import TimelineFuture from './TimelineFuture.svelte';
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;


	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';

	//let tempWidthA = 'calc((100vw - (100vw / 8)) / 15 * 12)';
	//let tempWidthB = 'calc(((100vw - (100vw / 8)) / 15 * 10) / 3 * 2)';


	let firstText = true;
	let secondText = false;
	let thirdText = false;
	let fourthText = false;
	let fifthText = false;

	let emissionGraph = false;
	let fullMeter = false;
	let halfMeter = false;
	let year20 = false;
	let line50 = false;
	let line30 = false;
	let sixthText = false;


	const togglefirstSetup = () => {
		firstText = true;
		secondText = false;
		thirdText = false;
		fourthText = false;
		fifthText = false;

		emissionGraph = false;
		fullMeter = false;
		halfMeter = false;
		line50 = false;
		line30 = false;
		year20 = false;
		sixthText = false;
	}

	const togglesecondSetup = () => {
		firstText = false;
		secondText = true;
		thirdText = false;
		fourthText = false;
		fifthText = false;

		emissionGraph = true;
		fullMeter = true;
		halfMeter = false;
		line50 = false;
		line30 = false;
		year20 = false;
		sixthText = false;
	}

	const togglethirdSetup = () => {
		firstText = false;
		secondText = false;
		thirdText = true;
		fourthText = false;
		fifthText = false;

		emissionGraph = true;
		fullMeter = true;
		halfMeter = false;
		line50 = false;
		line30 = false;
		year20 = true;
		sixthText = false;
	}

	const togglefourthSetup = () => {
		firstText = false;
		secondText = false;
		thirdText = false;
		fourthText = true;
		fifthText = false;

		emissionGraph = true;
		fullMeter = false;
		halfMeter = false;
		line50 = true;
		line30 = false;
		year20 = true;
		sixthText = false;
	}

	const togglefifthSetup = () => {
		firstText = false;
		secondText = false;
		thirdText = false;
		fourthText = false;
		fifthText = true;

		emissionGraph = true;
		fullMeter = false;
		halfMeter = true;
		line50 = true;
		line30 = true;
		year20 = true;
		sixthText = false;
	}

	const togglesixthSetup = () => {
		firstText = false;
		secondText = false;
		thirdText = false;
		fourthText = false;
		fifthText = true;

		emissionGraph = true;
		fullMeter = false;
		halfMeter = true;
		line50 = false;
		line30 = true;
		year20 = true;
		sixthText = true;
	}

</script>



<!--    BUTTONS    -->


{#if firstText}
	<div class="buttonNext" on:click={togglesecondSetup}></div>
	<a class="buttonPrev" href="{next}"></a>
{/if}
{#if secondText}
	<div class="buttonNext" on:click={togglethirdSetup}></div>
	<div class="buttonPrev" on:click={togglefirstSetup}></div>
{/if}
{#if thirdText}
	<div class="buttonNext" on:click={togglefourthSetup}></div>
	<div class="buttonPrev" on:click={togglesecondSetup}></div>
{/if}
{#if fourthText}
	<div class="buttonNext" on:click={togglefifthSetup}></div>
	<div class="buttonPrev" on:click={togglethirdSetup}></div>
{/if}
{#if fifthText}
	<div class="buttonNext" on:click={togglesixthSetup}></div>
	<div class="buttonPrev" on:click={togglefourthSetup}></div>
{/if}
{#if sixthText}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={togglefifthSetup}></div>
{/if}









<!--    TEXT    -->



<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	{#if firstText}
 		<div class="text">Emissions have risen steadily since the industrial revolution. <span class="transp">With our current level of emissions we have reached our limit. From now on we must reduce.</span></div>
 	{/if}
 	{#if secondText}
 		<div class="text">Emissions have risen steadily since the industrial revolution. With our current level of emissions we have reached our limit. <span class="transp">From now on we must reduce.</span></div>
 	{/if}
 	{#if thirdText}
 		<div class="text">Emissions have risen steadily since the industrial revolution. With our current level of emissions we have reached our limit. From now on we must reduce.</div>
 	{/if}
 	{#if fourthText}
 		<div class="text">To limit warming to 1,5°C, global CO2 emissions must have reached net-zero by&nbsp;2050. <span class="transp">To reach net-zero by 2050, emissions must be halved by 2030.</span></div>
 	{/if}
 	{#if fifthText}
 		<div class="text"><span class="transp">To limit warming to 1,5°C, global CO2 emissions must have reached net-zero by&nbsp;2050. </span>To reach net-zero by 2050, emissions must be halved by 2030.</div>
 	{/if}
</div>




<!--    CONTENT    -->


<div class="backgroundBox">
	{#if emissionGraph}
		<svg class="graph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 748.07" preserveAspectRatio="none">
			<polyline class="cls-1" points="365 748.07 0 748.07 0 0 68.47 0 78.61 94.09 111.59 187 148.35 280 194.96 374.03 224.21 467.1 252.83 561.07 331.85 654.03"/>
		</svg>
	{/if}
	{#if fourthText}
		<svg class="graph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 748.07" preserveAspectRatio="none">
			<polygon class="cls-2" points="365 748.07 0 748.07 0 467.1 365 748.07"/>
		</svg>
	{/if}
	{#if fifthText}
		<svg class="graph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 748.07" preserveAspectRatio="none">
			<polygon class="cls-2" points="365 748.07 0 748.07 0 467.1 182.5 654.03 365 748.07"/>
		</svg>
	{/if}
</div>





<div class="tempMeter">
	{#if fullMeter}
		<div class="temperature fullMeter"></div>
	{/if}
	{#if halfMeter}
		<div class="temperature halfMeter"></div>
	{/if}
	<div class="temperature infotext">
		<span class="tempnumber text">current level emissions</span>
		<span class="tempnumber left text">net-zero</span>
	</div>
</div>


{#if secondText}
	<TimelinePast></TimelinePast>
	<div class="text years left line0">2020</div>
	<div class="arrow text" style="width: {marginSides};">&uarr;</div>
{/if}

{#if thirdText}
	<TimelineFuture></TimelineFuture>
{/if}

{#if year20}
	<div class="text years right line0">2020</div>
{/if}


{#if fourthText}
	<div class="horizontalLine left" style="width: 100%; top: calc(({distanceBLines} * 6) - 1px);"></div>
	<div class="text years right line30">2050</div>
{/if}

{#if line50}
	<div class="line right line30"></div>
{/if}
{#if line30}
	<div class="text years right line10">2030</div>
	<div class="line right line10"></div>
{/if}




{#if fifthText}
	<div class="horizontalLine left" style="width: 100%; top: calc(({distanceBLines} * 8) - 1px);"></div>
{/if}
{#if sixthText}
	<div class="horizontalLine left" style="width: 100%; top: calc(({distanceBLines} * 8) - 1px); border-top: 1px solid blue;"></div>
	<div class="text criticalText" style="left: {marginSides}; right: {marginSides}; top: calc(({distanceBLines} * 8);">This is a Critical Decade.</div>
{/if}







<!--    DOTS    -->


<div class="activedot activedot5"></div>
<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>






<style>

	.text {color: blue;}
	.arrow {text-align: center;}
	.line {background-color: blue;}
	.backgroundBox {
		background-color: rgb(245,245,245);
		overflow: hidden; 
		border-bottom-right-radius: 0px; 
		border-left: 1px solid blue; 
		border-right: 1px solid blue;
	}

	.tempMeter {
		border-left: 1px solid blue; 
		border-right: 1px solid blue;
	}
	.temperature {border: 1px dotted blue;}
	.infotext {
		width: 100%; 
		background-color: rgba(0,0,0,0) !important; 
		border: none;
	}
	.fullMeter {
		width: 100%; 
		background-color: rgba(230,230,230,1) !important; 
		border: none; 
		border-radius: 20px;
	}
	.halfMeter {
		width: 50%; 
		background-color: beige !important; 
		border: none; 
		border-bottom-left-radius: 20px; 
		border-top-left-radius: 20px;
	}
	.verticalLine {border-right: 1px dotted blue;}
	.horizontalLine {border-top: 1px dotted blue;}


</style>