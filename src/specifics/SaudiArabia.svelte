<script>
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;


	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';

	let firstSetup = true;	
	let secondSetup = false;
	let thirdSetup = false;
	let fourthSetup = false;
	let fifthSetup = false;

	const togglefirstSetup = () => {
		firstSetup = true;
		secondSetup = false;
	}
	const togglesecondSetup = () => {
		firstSetup = false;
		secondSetup = true;
		thirdSetup = false;
	}
	const togglethirdSetup = () => {
		secondSetup = false;
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
	<!--<div class="buttonNext" on:click={togglefourthSetup}></div>-->
	<div class="buttonPrev" on:click={togglesecondSetup}></div>
{/if}
<!--{#if fourthSetup}
	<div class="buttonNext" on:click={togglefifthSetup}></div>
	<div class="buttonPrev" on:click={togglethirdSetup}></div>
{/if}
{#if fifthSetup}
	<div class="buttonNext" on:click={togglesixthSetup}></div>
	<div class="buttonPrev" on:click={togglefourthSetup}></div>
{/if}
{#if sixthSetup}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={togglefifthSetup}></div>
{/if}-->





<!-- CONENT -->


<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>





{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Saudi Arabia is one of the countries on the Highest ranking list.
	</div>	
{/if}

<!-- Link history of Aramco: https://www.saudiaramco.com/en/who-we-are/overview/our-history -->






<!-- GRAPH -->

	<div class="tempMeterCountry">
		<div class="temperature infotext">
			<span class="tempnumber left text" style="z-index: 99999999;">365 days</span>
		</div>
	</div>
	
{#if firstSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 344 900 344 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature firstMeter"></div>
		<div class="temperature infotext">
			<span class="tempnumber rightFirst text">21 days</span>
		</div>
	</div>

	<div class="text years right line0">2020</div>
	<div class="horizontalLine full right line0"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if secondSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 328 600 328 900 344 900 344 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature midMeter"></div>
		<div class="temperature infotext">
			<span class="tempnumber rightMid text">37 days</span>
		</div>
	</div>

	<div class="text years right line40">2060</div>
	<div class="horizontalLine full right line40"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if thirdSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 292 0 292 300 328 600 328 900 344 900 344 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature endMeter"></div>
		<div class="temperature infotext">
			<span class="tempnumber rightEnd text">73 days</span>
		</div>
	</div>

	<div class="text years right line60">2080</div>
	<div class="horizontalLine full right line60"></div>
	<div class="line right line60"></div>
	<div class="text years right line80">2100</div>
	<div class="horizontalLine full right line80"></div>
	<div class="line right line80"></div>
{/if}







<!-- FOOTER + STATIC -->

<div class="horizontalLine left" style="width: 100%; top: calc(({distanceBLines} * 8) - 1px); border-top: 1px solid blue;"></div>


<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>






<style>

	.text {color: green !important;}
	.text a {color: green;}
	.verticalLine {border-right: 1px dotted green;}
	.horizontalLine {border-top: 1px dotted green;}
	.line {background-color: green;}

	/*.cls-1, .hotDays {fill: beige !important;}*/

	.tempMeterCountry {
		border-left: 1px solid /*rgb(70,70,70)*/ green; 
		border-right: 1px solid /*rgb(70,70,70)*/ green;
	}
	.firstMeter, .midMeter, .endMeter {border-left: 1px dotted green;}
	.firstMeter {width: calc(((100% / 365) * 21) - 1px);}
	.midMeter {width: calc(((100% / 365) * 37) - 1px);}
	.endMeter {width: calc(((100% / 365) * 73) - 1px);}
	/*.cls-1 {fill: beige !important;}*/
	.rightFirst {right: calc(((100vw / 365) * 21) - 1px);}
	.rightMid {right: calc(((100vw / 365) * 37) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 73) - 1px);}

</style>