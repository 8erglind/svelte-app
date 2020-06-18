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
	let secondSetup = false;
	let secondText = false;
	let temp = false;


	const togglefirstSetup = () => {
		firstSetup = true;
		secondSetup = false;
		secondText = false;
		temp = false;
		thirdSetup = false;

	}

	const togglesecondSetup = () => {
		firstSetup = false;
		secondSetup = true;
		secondText = true;
		temp = true;
		thirdSetup = false;
	}

</script>




<!--    BUTTONS    -->


{#if firstSetup}
	<div class="buttonNext" on:click={togglesecondSetup}></div>
	<a class="buttonPrev" href="{next}"></a>
{/if}
{#if secondSetup}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={togglefirstSetup}></div>
{/if}







<!--    TEXT    -->


<!--<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>-->
<div class="pagetitle" style="transform: rotate({rotate});">Extreme<br>Heat:<br>I</div>



{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		It’s June, after the warmest May on record. Its getting warmer, and Extreme heat is becoming more and more common.
	</div>
{/if}
{#if secondText}
	<div class="pagetext" style="transform: rotate({rotate});">
		The dangers of heat depend on temperature and humidity. High humidity makes it harder for sweat to evaporate from the body, which can cause it to overheat.
	</div>
{/if}





<!--    CONTENT    -->



{#if firstSetup}
	<div class="sweatdrop falling"></div>
	<div class="sweatdrop falling2"></div>
	<!--<div class="backgroundBox">
		<svg class="graph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 700" preserveAspectRatio="none">
			<polygon class="caution" style="background-color: yellow;" points="0 0 250 0 250 100 200 100 200 200 150 200 150 400 100 400 100 500 50 500 50 700 0 700 0 0"/>
			<polygon class="extremeCaution" points="450 0 450 100 400 100 400 200 300 200 300 300 250 300 250 400 200 400 200 500 150 500 150 700 50 700 50 500 100 500 100 400 150 400 150 200 200 200 200 100 250 100 250 0 450 0"/>
			<polygon class="danger" points="450 0 700 0 700 100 600 100 600 200 500 200 500 300 400 300 400 400 350 400 350 500 300 500 300 600 250 600 250 700 150 700 150 500 200 500 200 400 250 400 250 300 300 300 300 200 400 200 400 100 450 100 450 0"/>
			<polyline class="extremeDanger" points="800 700 250 700 250 600 300 600 300 500 350 500 350 400 400 400 400 300 500 300 500 200 600 200 600 100 700 100 700 0 800 0 800 700"/>
		</svg>
	</div>-->
{/if}

{#if secondSetup}
	<div class="backgroundBox">
		<svg class="graph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 700" preserveAspectRatio="none">
			<polygon class="caution" style="background-color: yellow;" points="0 0 250 0 250 100 200 100 200 200 150 200 150 400 100 400 100 500 50 500 50 700 0 700 0 0"/>
			<polygon class="extremeCaution" points="450 0 450 100 400 100 400 200 300 200 300 300 250 300 250 400 200 400 200 500 150 500 150 700 50 700 50 500 100 500 100 400 150 400 150 200 200 200 200 100 250 100 250 0 450 0"/>
			<polygon class="danger" points="450 0 700 0 700 100 600 100 600 200 500 200 500 300 400 300 400 400 350 400 350 500 300 500 300 600 250 600 250 700 150 700 150 500 200 500 200 400 250 400 250 300 300 300 300 200 400 200 400 100 450 100 450 0"/>
			<polyline class="extremeDanger" points="800 700 250 700 250 600 300 600 300 500 350 500 350 400 400 400 400 300 500 300 500 200 600 200 600 100 700 100 700 0 800 0 800 700"/>
		</svg>
	</div>

	{#if temp}
		<div class="text celcius celciusTop" style="bottom: calc({distanceBLines} * 8);">Temp.</div>
	{/if}
	<div class="text humidity humidityTop" style="top: calc({distanceBLines} * 1); right: calc(100vw - {marginSides}); height: calc({distanceBLines} * 8);">Humidity</div>
	<div class="text humidity" style="top: calc({distanceBLines} * 1); left: 5px;">0%</div>
	<div class="text humidity" style="bottom: 0%; left: 5px;">100%</div>

	<div class="text celcius" style="bottom: calc({distanceBLines} * 8); left: {celciusWidth};">26,6 °C</div>
	<div class="text celcius" style="bottom: calc({distanceBLines} * 8); right: calc({celciusWidth} * 1);">41.1 °C</div>

	{#if temp}
		<div class="text celcius inGraph" style="top: calc({distanceBLines} + 15px); left: calc({celciusWidth} + 15px); /*transform: rotate({rotate});*/">Caution</div>
	{/if}
	<div class="text celcius inGraph" style="bottom: 15px; right: calc({celciusWidth} + 15px); /*transform: rotate({rotate});*/">Extreme Danger</div>
{/if}







<!--    FOOTER    -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			Source <a target="_blank" href="">[1]</a>.
		</div>
</div>

<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>






<style>

	.text, .text a, .pagetext {color: darkred !important;}
	.caution {fill: /*yellow*/ rgba(229,83,20,0.01);}
	.extremeCaution {fill: /*orange*/ rgba(229,83,20,.05);}
	.danger {fill: /*darkorange*/ rgba(229,83,20,.09);}
	.extremeDanger {fill: /*red*/ rgba(229,83,20,.13);}
	.backgroundBox {overflow: hidden; border-top-left-radius: 0px; border-right: 1px solid darkred; border-bottom: 1px solid darkred;background-color: rgb(245,245,245);}

	.celcius, .humidity {position: absolute;}
	.celciusTop {width: 100%; text-align: center;}
	.humidityTop {
		writing-mode: vertical-rl; 
		-webkit-writing-mode: vertical-rl;
		text-orientation: upright;
		-webkit-text-orientation: upright; 
		line-height: 5px; 
		height: 100%; 
		text-align: center;
	}
	.inGraph {font-family: arial; text-transform: uppercase;}


	.falling {
		animation-name: example; 
    	animation-fill-mode: forwards;
    	transition-timing-function: ease-in-out;
	    animation-duration: 10s;  
	    animation-fill-mode: forwards;
	    animation-delay: 2s;
	    opacity: 0; top: 20%; left: 10vw;
	}
	@keyframes example {
	  0% {top: 20%; left: 10vw; opacity: 0;}
	  2% {opacity: 1;}
	  100% {top: calc(90% - 85px); left: 90vw; opacity: 1;}
	}
	.falling2 {
		animation-name: exampletwo;
    	animation-fill-mode: forwards;
    	transition-timing-function: ease-in-out;
	    animation-duration: 10s;  
	    animation-delay: 7s;
	    opacity: 0; top: 30%; left: 5vw;
	}
	@keyframes exampletwo {
	  0% {top: 30%; left: 5vw; opacity: 0;}
	  2% {opacity: 1;}
	  100% {top: calc(97% - 85px); left: calc(100vw - 25px); opacity: 1;}
	}



</style>