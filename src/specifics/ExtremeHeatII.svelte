<script>
	import TimelinePast from './TimelinePast.svelte';
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;

	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';
	let celciusWidth = 'calc((100vw - (100vw / 8)) / 16)';
	

	let firstSetup = true;
	let firstText = true;
	let secondSetup = false;
	let thirdSetup = false;


	const togglefirstSetup = () => {
		firstSetup = true;
		firstText = true;
		secondSetup = false;
		thirdSetup = false;
	}

	const togglesecondSetup = () => {
		firstSetup = true;
		firstText = false;
		secondSetup = true;
		thirdSetup = false;
	}
	const togglethirdSetup = () => {
		firstSetup = true;
		firstText = false;
		secondSetup = true;
		thirdSetup = true;
	}
</script>




<!--    BUTTONS    -->


{#if firstSetup}
	<div class="buttonNext" on:click={togglesecondSetup}></div>
	<a class="buttonPrev" href="{next}"></a>
{/if}
{#if secondSetup}
	<div class="buttonNext" on:click={togglethirdSetup}></div>
	<div class="buttonPrev" on:click={togglefirstSetup}></div>
{/if}
{#if thirdSetup}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={togglesecondSetup}></div>
{/if}







<!--    TEXT    -->


<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	{#if firstText}
 		<div class="text"><span class="transp">When the temperature becomes close to, or highter than that of the human body, the body can no longer easily cool itself down and runs the risk of overheating.</span></div>
 	{/if}
 	{#if secondSetup}
 		<div class="text"><!--A temperature of around 35°C and higher is dangerously close to the temperature of the human body, making it harder for the body to cool itself down.-->When the temperature becomes close to, or highter than that of the human body, the body can no longer easily cool itself down and runs the risk of overheating.</div>
 	{/if}

</div>




<!--    CONTENT    -->

{#if firstSetup}
	<div class="backgroundBox">
	</div>

	<div class="text celcius" style="bottom: calc({distanceBLines} * 8); left: {celciusWidth};">26,6 °C</div>
	<div class="text celcius" style="bottom: calc({distanceBLines} * 8); right: calc({celciusWidth} * 1);">41.1 °C</div>

	{#if thirdSetup}
	{:else}
	<div class="text celcius" style="bottom: calc({distanceBLines} * 8); left: calc({celciusWidth} * 9.5);">35°C</div>
	<div style="position: absolute; left: calc({celciusWidth} * 10); width: 0px; border-right: 1px dotted darkred; height: calc({distanceBLines} * 8); top: calc({distanceBLines} * 1);"></div>
	{/if}


	<div style="position: absolute; bottom: 0%; top: {distanceBLines}; left: calc({celciusWidth} * 11); right: calc({celciusWidth} * 5); height: calc({distanceBLines} * 8); background-color: rgba(230,230,230);"></div>
	<div class="text celcius" style="bottom: 0%; left: calc({celciusWidth} * 11); right: calc({celciusWidth} * 5); text-align: center;">body<br>temp.</div>
{/if}

{#if thirdSetup}
	<div class="text celcius inGraph" style="top: calc({distanceBLines} * 1.5); left: {celciusWidth}; transform: rotate({rotate});">Caution</div>
	<div class="text celcius inGraph" style="bottom: calc({distanceBLines} * 1.5); right: {celciusWidth}; transform: rotate({rotate});">Extreme Danger</div>
{/if}





<!--    DOTS    -->


<div class="activedot activedot3"></div>
<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>






<style>

	.text {color: darkred;}
	.backgroundBox {overflow: hidden; border-radius: 0px; background-color: rgb(245,245,245);}
	.celcius {position: absolute;}
	.celciusTop {width: 100%; text-align: center;}
	.inGraph {font-family: arial; text-transform: uppercase;}

</style>