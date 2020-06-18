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


	const togglefirstSetup = () => {
		firstSetup = true;
		secondSetup = false;
	}

	const togglesecondSetup = () => {
		firstSetup = false;
		secondSetup = true;
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
<div class="pagetitle" style="transform: rotate({rotate});">Extreme<br>Heat:<br>II</div>


{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});font-weight: normal;
        font-style: normal;">
		When the temperature start to approach that of the human body, they become extremely dangerous. Heat of 35°C, especially when humid, can only be endured for several hours at a time before it becomes fatal.
	</div>
{/if}
{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});font-weight: normal;
        font-style: normal;">
		With each eccess extremely hot day of 35°C, mortality rates increase by ~&nbsp;0,0004%.
	</div>
{/if}





<!--    CONTENT    -->


<div class="backgroundBox"></div>

<div class="text celcius" style="bottom: calc({distanceBLines} * 8); left: {celciusWidth};">26,6 °C</div>
<div class="text celcius" style="bottom: calc({distanceBLines} * 8); right: calc({celciusWidth} * 1);">41.1 °C</div>

<div class="text celcius" style="bottom: calc({distanceBLines} * 8); left: calc({celciusWidth} * 9.5);">35°C</div>

<div style="position: absolute; left: calc({celciusWidth} * 10); width: 0px; border-right: 1px dotted darkred; height: calc({distanceBLines} * 8); top: calc({distanceBLines} * 1);"></div>

<div class="bodyTemp" style="top: {distanceBLines}; left: calc({celciusWidth} * 11); right: calc({celciusWidth} * 5); height: calc({distanceBLines} * 8);"></div>

<div class="text celcius" style="bottom: 0%; left: calc({celciusWidth} * 11); right: calc({celciusWidth} * 5); text-align: center;">body<br>temp.</div>







<!--    FOOTER    -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			Source <a target="_blank" href="">[1]</a>{#if secondSetup}, <a target="_blank" href="">[2]</a>{/if}.
		</div>
</div>

<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>






<style>

	.text, .text a, .pagetext {color: darkred !important;}
	.backgroundBox {overflow: hidden; border-radius: 0px; background-color: rgb(245,245,245); border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;}
	.celcius {position: absolute;}
	.celciusTop {width: 100%; text-align: center;}
	.inGraph {font-family: arial; text-transform: uppercase;}

	.bodyTemp {
		position: absolute; 
		bottom: 0%; 
		background-color: rgba(229,83,20,.15);
	}

</style>