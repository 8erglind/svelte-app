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
		Text about Iceland. Really lucky geographically.
	</div>	
{/if}






<!-- GRAPH -->

	<div class="tempMeterCountry">
		<div class="temperature infotext"><span class="tempnumber left text" style="z-index: 99999999;">365 days</span></div>
	</div>
	<div class="tempMeterCountry">
		<div class="temperature midMeter"><span class="deathToll text narrow">&#10013; 0</span></div>
		<div class="temperature infotext"><span class="tempnumber rightFirst text">0 days</span></div>
	</div>


{#if firstSetup}
	<div class="text years right line0 now">2020</div>
	<div class="horizontalLine full right line0"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if secondSetup}
	<div class="text years right line40">2060</div>
	<div class="horizontalLine full right line40"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if thirdSetup}
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

.text {color: mediumblue !important;}
	.text a {color: mediumblue;}
	.verticalLine {border-right: 1px dotted mediumblue;}
	.horizontalLine {border-top: 1px dotted mediumblue;}
	.line {background-color: mediumblue;}
	.tempMeterCountry {
		border-left: 1px solid /*rgb(70,70,70)*/ mediumblue; 
		border-right: 1px solid /*rgb(70,70,70)*/ mediumblue;
	}
	.midMeter {width: calc(((100% / 365) * 0) - 1px);}
	.midMeter:after {border-right: 1px dotted mediumblue;}

	.rightFirst {right: calc(((100vw / 365) * 0) - 1px);}
	.rightMid {right: calc(((100vw / 365) * 0) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 0) - 1px);}

</style>