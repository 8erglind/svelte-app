<script>
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


<!--<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>-->
<div class="pagetitle" style="transform: rotate({rotate});">The<br>Critical<br>Decade:<br>I</div>

{#if firstText}
	<div class="pagetext" style="transform: rotate({rotate});">
		Since 1880 Earth’s average global temperature has increased by 1,1&nbsp;-&nbsp;1,3°C. 
	</div>
{/if}
{#if secondText}
	<div class="pagetext" style="transform: rotate({rotate});">
		Two-thirds of that warming happened in the last 45&nbsp;years. 
	</div>
{/if}
{#if thirdText}
	<div class="pagetext" style="transform: rotate({rotate});">The Paris Agreement aims to limit warming to&nbsp;+&nbsp;1,5°C.</div>
{/if}





<!--    CONTENT    -->


<div class="backgroundBox"></div>



<div class="tempMeter">
	<div class="temperature" style="left: {marginSides}; border: none;">
		<span class="tempnumber text">0°C</span>
	</div>
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
	<div class="line left line10"></div>
	<div class="line left line20"></div>
	<div class="line left line30"></div>
	<div class="line left line40"></div>
	<div class="line left line50"></div>
	<div class="line left line60"></div>
	<div class="line left line70"></div>
	<div class="line left line80"></div>

	<div class="text years left line10">2010</div>
	<div class="text years left line20">2000</div>
	<div class="text years left line30">1990</div>
	<div class="text years left line40">1980</div>
	<div class="text years left line50">1970</div>
	<div class="text years left line60">1960</div>
	<div class="text years left line70">1950</div>
	<div class="text years left line80">1940</div>

	<div class="verticalLine fromTop" style="left: calc({marginSides} + {tempWidthA}); height: calc({distanceBLines} * 9);"></div>
{/if}


<div class="line left line0"></div>
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
	<div class="verticalLine fromTop" style="right: {marginSides}; height: calc({distanceBLines} * 9);"></div>

	<div class="line right line0"></div>
	<div class="line right line10"></div>
	<div class="line right line20"></div>
	<div class="line right line30"></div>
	<div class="line right line40"></div>
	<div class="line right line50"></div>
	<div class="line right line60"></div>
	<div class="line right line70"></div>
	<div class="line right line80"></div>

	<div class="text years right line0">2020</div>
	<div class="text years right line10">2030</div>
	<div class="text years right line20">2040</div>
	<div class="text years right line30">2050</div>
	<div class="text years right line40">2060</div>
	<div class="text years right line50">2070</div>
	<div class="text years right line60">2080</div>
	<div class="text years right line70">2090</div>
	<div class="text years right line80">2100</div>
{/if}





<!--     FOOTER     -->

<div class="text bottomLine">
	<!--{#if firstText}
		<div class="bottomLineText">
			Since 1880 Earth’s average global temperature has increased by 1,1&nbsp;-&nbsp;1,3°C.
		</div>
	{/if}
	{#if secondText}
		<div class="bottomLineText">
			Two-thirds of that warming happened in the last 45&nbsp;years.
		</div>
	{/if}
	{#if thirdText}
		<div class="bottomLineText">
			The Paris Agreement aims to limit <i>future</i> warming to&nbsp;+&nbsp;1,5°C.
		</div>
	{/if}-->
</div>






<!--    DOTS    -->


<div class="activedot activedot5"></div>
<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>

	/*.pagetitle .text {/*-webkit-text-fill-color: rgb(190,190,190) purple;} */
	.text, .text a, .pagetext {color: darkorange !important;}
	.arrow {text-align: center;}
	.line {background-color: darkorange;}
	.backgroundBox {background-color: rgb(245,245,245);}
	.temperature {border: 1px dotted darkorange;}
	.verticalLine {border-right: 1px dotted darkorange;}
	.horizontalLine {border-top: 1px dotted darkorange;}


</style>