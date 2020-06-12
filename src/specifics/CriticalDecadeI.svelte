<script>
	import TimelinePast from './TimelinePast.svelte';
	import TimelineFuture from './TimelineFuture.svelte';
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;


	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';

	let tempWidthA = 'calc((100vw - (100vw / 8)) / 15 * 12)';
	let tempWidthB = 'calc(((100vw - (100vw / 8)) / 15 * 10) / 3 * 1)';


	let firstText = true;
	let secondText = false;
	let thirdText = false;

	let secondLines = false;


	const togglefirstSetup = () => {
		firstText = true;
		secondText = false;
		thirdText = false;

		secondLines = false;
	}

	const togglesecondSetup = () => {
		firstText = false;
		secondText = true;
		thirdText = false;

		secondLines = true;
	}

	const togglethirdSetup = () => {
		firstText = false;
		secondText = false;
		thirdText = true;
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
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={togglesecondSetup}></div>
{/if}









<!--    TEXT    -->


<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	{#if firstText}
 		<div class="text">Since 1880<!-- , in 140 years,--> Earth’s average global temperature has increased by 1,1&nbsp;-&nbsp;1,3°C.<br><span class="transp"> Two-thirds of that warming happened in the last 45&nbsp;years. The Paris Agreement <!--(which has been critisized for not being radical enough) -->aims to limit warming to&nbsp;+&nbsp;1,5°C<!-- by&nbsp;2100-->.</span></div>
 	{/if}
 	{#if secondText}
 		<div class="text"><span class="transp">Since 1880<!-- , in 140 years,--> Earth’s average global temperature has increased by 1,1&nbsp;-&nbsp;1,3°C.<br></span> Two-thirds of that warming happened in the last 45&nbsp;years.<span class="transp"> The Paris Agreement <!--(which has been critisized for not being radical enough) -->aims to limit warming to&nbsp;+&nbsp;1,5°C<!-- by&nbsp;2100-->.</span></div>
 	{/if}
 	{#if thirdText}
 		<div class="text"><span class="transp">Since 1880<!-- , in 140 years,--> Earth’s average global temperature has increased by 1,1&nbsp;-&nbsp;1,3°C.<br> Two-thirds of that warming happened in the last 45&nbsp;years. </span>The Paris Agreement <!--(which has been critisized for not being radical enough) -->aims to limit warming to&nbsp;+&nbsp;1,5°C<!-- by&nbsp;2100-->.</div>
 	{/if}
</div>





<!--    CONTENT    -->


<div class="backgroundBox"></div>



<div class="tempMeter">
	<div class="temperature" style="width: calc({tempWidthA} - 1px);">
		<span class="tempnumber text">1,2°C</span>
	</div>
	{#if thirdText}
		<div class="temperature" style="width: 100%; background-color: rgba(0,0,0,0) !important; border: none;">
			<span class="tempnumber text">1,5°C</span>
		</div>
	{/if}
</div>
<div class="arrow text" style="width: {marginSides};">&uarr;</div>



{#if firstText}
	<TimelinePast></TimelinePast>

	<div class="verticalLine fromTop" style="left: calc({marginSides} + {tempWidthA}); height: calc({distanceBLines} * 9);"></div>
{/if}


<div class="text years left line0">2020</div>


{#if secondLines}
	<div class="verticalLine fromTop" style="left: calc({marginSides} + {tempWidthB}); height: calc({distanceBLines} * 4.5);"></div>
	<div class="horizontalLine" style="left: calc({marginSides} + {tempWidthB}); width: calc({tempWidthA} - {tempWidthB}); top: calc({distanceBLines} * 4.5);"></div>
	<div class="verticalLine" style="left: calc({marginSides} + {tempWidthA}); top: calc({distanceBLines} * 4.5); height: calc({distanceBLines} * 4.5);"></div>
	{#if secondText}
		<div class="text years left line45">1975</div>
	{/if}
	<div class="line left line45"></div>
{/if}


{#if thirdText}
	<TimelineFuture></TimelineFuture>
	<div class="verticalLine fromTop" style="right: {marginSides}; height: calc({distanceBLines} * 9);"></div>
	<div class="text years right line0">2020</div>
{/if}







<!--    DOTS    -->


<div class="activedot activedot5"></div>
<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>






<style>

	/*.pagetitle .text {/*-webkit-text-fill-color: rgb(190,190,190) purple;} */
	.text {color: darkorange;}
	.arrow {text-align: center;}
	.line {background-color: darkorange;}
	.backgroundBox {background-color: rgb(245,245,245);}
	.temperature {border: 1px dotted darkorange;}
	.verticalLine {border-right: 1px dotted darkorange;}
	.horizontalLine {border-top: 1px dotted darkorange;}


</style>