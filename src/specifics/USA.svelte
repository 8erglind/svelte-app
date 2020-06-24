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
	let sixthSetup = false;
	let seventhSetup = false;
	let eightthSetup = false;
	let ninethSetup = false;
	let	tenthSetup = false;
	let	eleventhSetup = false;

	let graph = false;

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
		fourthSetup = false;
	}
	const togglefourthSetup = () => {
		thirdSetup = false;
		fourthSetup = true;
		fifthSetup = false;
	}
	const togglefifthSetup = () => {
		fourthSetup = true;
		fifthSetup = true;
		sixthSetup = false;

		graph = false;
	}
	const togglesixthSetup = () => {
		fourthSetup = true;

		fifthSetup = false;
		sixthSetup = true;
		seventhSetup = false;

		graph = true;
	}
	const toggleseventhSetup = () => {
		fourthSetup = true;

		sixthSetup = false;
		seventhSetup = true;
		eightthSetup = false;

		graph = true;
	}
	const toggleeighthSetup = () => {
		fourthSetup = false;
		seventhSetup = true;

		eightthSetup = true;
		ninethSetup = false;

		graph = true;
	}
	const toggleninethSetup = () => {
		seventhSetup = true;

		eightthSetup = false;
		ninethSetup = true;
		tenthSetup = false;

		graph = true;
	}
	const toggletenthSetup = () => {
		seventhSetup = true;

		ninethSetup = false;
		tenthSetup = true;
		eleventhSetup = false;

		graph = true;
	}
	const toggleeleventhSetup = () => {
		seventhSetup = true;

		tenthSetup = false;
		eleventhSetup = true;

		graph = true;
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
	<div class="buttonNext" on:click={togglefourthSetup}></div>
	<div class="buttonPrev" on:click={togglesecondSetup}></div>
{/if}
{#if fourthSetup}
	<div class="buttonNext" on:click={togglefifthSetup}></div>
	<div class="buttonPrev" on:click={togglethirdSetup}></div>
{/if}
{#if fifthSetup}
	<div class="buttonNext" on:click={togglesixthSetup}></div>
	<div class="buttonPrev" on:click={togglefourthSetup}></div>
{/if}
{#if sixthSetup}
	<div class="buttonNext" on:click={toggleseventhSetup}></div>
	<div class="buttonPrev" on:click={togglefifthSetup}></div>
{/if}
{#if seventhSetup}
	<div class="buttonNext" on:click={toggleeighthSetup}></div>
	<div class="buttonPrev" on:click={togglesixthSetup}></div>
{/if}
{#if eightthSetup}
	<div class="buttonNext" on:click={toggleninethSetup}></div>
	<div class="buttonPrev" on:click={toggleseventhSetup}></div>
{/if}
{#if ninethSetup}
	<div class="buttonNext" on:click={toggletenthSetup}></div>
	<div class="buttonPrev" on:click={toggleeighthSetup}></div>
{/if}
{#if tenthSetup}
	<div class="buttonNext" on:click={toggleeleventhSetup}></div>
	<div class="buttonPrev" on:click={toggleninethSetup}></div>
{/if}
{#if eleventhSetup}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={toggletenthSetup}></div>
{/if}




<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>


{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		The tactics described by Freire are awfully similar to those used by powerforces today in the U.S. (and beyond), one example being Trump calling peaceful protesters&nbsp;thugs.
	</div>	
{/if}

{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		The U.S. is built on oppression and dehumanisation. On stolen land with stolen labour. Colonialism and Slavery were made possible by a system that rationalised the expoitation of certain groups of people, who were deamed ‘inferior’, for the economic growth of a ‘superior’ (white) group of people on a scale that would not be possible or sustainable without&nbsp;it.
	</div>	
{/if}

{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		This system is still in place, as has been clearly and widely demonstrated in the last months. Dehumanization through cheap/free/involuntary labour and limited human rights is not bound to non-white people in faraway countries, but is also live and well within the&nbsp;U.S. ...
	</div>	
{/if}

{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		... ... ExxonMobile, BP, Shell, American Airlines, Boeing and KOCH industries, are only a few of the companies that use cheap prison labour. Many of the companies that fuel the climate crisis use dehumanization as an economic strategy, they depend on&nbsp;it.
	</div>	
{/if}

{#if eightthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		The blues were created by the enslaved, it became a sort of coping mechanism. The blues created rock - motown - disco -  hip hop. This music inspired the rock and roll movement in Cambodia, highlife development in Ghana (ET Mensah), Tropicália in Brazil, Icelandic musicindustry, the&nbsp;Beatles.
	</div>	
{/if}

{#if ninethSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Black voices in America have been the voice of change (although overtly ignored). As Freire stated, change can only be organised by the oppressed, as the oppressors lack capacity to fully understand the problem (their attempts can often result in false generousity or objectification of the oppressed). From Octavia E. Butler<!-- (1993)--> to bell hooks, black women have preached environmentalism for&nbsp;decades. 
	</div>	
{/if}

{#if tenthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		bell hooks released the book ‘All About Love’ in 2000. In it she writes about the importance of understanding love, “Our confusion about what we mean when we use the word “love” is the source of our difficulty in loving. If our society had a commonly held understanding of the meaning of love, the act of loving would not be so mystifying.”
	</div>	
{/if}

{#if eleventhSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		She defines love as being the combination of&nbsp;six&nbsp;aspects:<br>care, commitment, knowledge, responsibility, respect and&nbsp;trust.
	</div>	
{/if}







<!-- GRAPH -->
{#if graph}
	<div class="tempMeterCountry">
		<div class="temperature infotext">
			<span class="tempnumber left text" style="z-index: 99999999;">365 days</span>
		</div>
	</div>
{/if}

{#if fifthSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 353 900 353 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature firstMeter"><span class="deathToll text">&#10013;&#xFE0E; 16.335</span></div>
		<div class="temperature infotext"><span class="tempnumber rightFirst text">12 days</span></div>
	</div>

	<div class="text years right line0 now">2020</div>
	<div class="horizontalLine full right line0"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if sixthSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 340 600 340 900 353 900 353 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature midMeter"><span class="deathToll text">&#10013;&#xFE0E; 37.300</span></div>
		<div class="temperature infotext"><span class="tempnumber rightMid text">25 days</span></div>
	</div>

	<div class="text years right line40">2060</div>
	<div class="horizontalLine full right line40"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if seventhSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 305 0 305 300 340 600 340 900 353 900 353 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature endMeter"><span class="deathToll text">&#10013;&#xFE0E; 101.882</span></div>
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

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			{#if fifthSetup}<a href="https://deadwhitemansclothes.org/intro" target="_blank">[more &nearr;&#xFE0E;]</a>{/if}
			{#if sixthSetup}<a href="https://www.instagram.com/p/B5VfzzlhmOv/" target="_blank">[more &nearr;&#xFE0E;] <a href="https://www.instagram.com/tv/B-Sltgypx7O/" target="_blank">[more &nearr;&#xFE0E;].</a></a>{/if}
		</div>
</div>

<div class="horizontalLine left" style="width: 100%; top: calc({distanceBLines} * 8); border-top: 1px solid blue;"></div>



<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>

	.text, .text a, .pagetext {color: red !important;}
	.pagetitle {bottom: 75%;}
	.pagetext {bottom: 20%;}
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