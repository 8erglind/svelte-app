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




<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>


{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Text about Ghana.
	</div>	
{/if}








<!-- GRAPH -->

	<div class="tempMeterCountry">
		<div class="temperature infotext">
			<span class="tempnumber left text" style="z-index: 99999999;">365 days</span>
		</div>
	</div>

{#if firstSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 353 900 353 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature firstMeter"><span class="deathToll text">&#10013; 16.335</span></div>
		<div class="temperature infotext"><span class="tempnumber rightFirst text">12 days</span></div>
	</div>

	<div class="text years right line0">2020</div>
	<div class="horizontalLine full right line0"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if secondSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 340 600 340 900 353 900 353 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature midMeter"><span class="deathToll text">&#10013; 37.300</span></div>
		<div class="temperature infotext"><span class="tempnumber rightMid text">25 days</span></div>
	</div>

	<div class="text years right line40">2060</div>
	<div class="horizontalLine full right line40"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if thirdSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 305 0 305 300 340 600 340 900 353 900 353 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature endMeter"><span class="deathToll text">&#10013; 101.882</span></div>
		<div class="temperature infotext"><span class="tempnumber rightEnd text">60 days</span></div>
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
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>

.text {color: red !important;}
	.text a {color: red;}
	.verticalLine {border-right: 1px dotted red;}
	.horizontalLine {border-top: 1px dotted red;}
	.line {background-color: red;}
	.tempMeterCountry {
		border-left: 1px solid red; 
		border-right: 1px solid red;
	}
	.firstMeter, .midMeter, .endMeter {border-left: 1px dotted red;}
	.firstMeter {width: calc(((100% / 365) * 12) - 1px);}
	.midMeter {width: calc(((100% / 365) * 25) - 1px);}
	.endMeter {width: calc(((100% / 365) * 60) - 1px);}
	.firstMeter:after, .midMeter:after, .endMeter:after {border-right: 1px dotted red;}
	.rightFirst {right: calc(((100vw / 365) * 12) - 1px);}
	.rightMid {right: calc(((100vw / 365) * 25) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 60) - 1px);}


</style>