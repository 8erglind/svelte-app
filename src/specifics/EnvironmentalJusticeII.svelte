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
		fourthSetup = false;
		fifthSetup = true;
		sixthSetup = false;
	}
	const togglesixthSetup = () => {
		fifthSetup = false;
		sixthSetup = true;
		seventhSetup = false;
	}
	const toggleseventhSetup = () => {
		sixthSetup = false;
		seventhSetup = true;
		eightthSetup = false;
	}
	const toggleeighthSetup = () => {
		seventhSetup = false;
		eightthSetup = true;
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
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={toggleseventhSetup}></div>
{/if}




<!-- CONTENT -->

<div class="pagetitle" style="transform: rotate({rotate});">Environ-<br>mental<br>Justice:<br>II</div>

{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		garment workers in other countries (“only an estimated 2% of garment workers around the globe are paid a living wage” -sustainablefashiondublin from fashion revolution)
	</div>	
{/if}

{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Colonialism and Slavery were made possible by a system that rationalised the expoitation of certain groups of people, who were deamed ‘inferior’, for the economic growth of a ‘superior’ (white) group of people on a scale that would not be possible or sustainable without it.<br>
		This system is still in place. 
	</div>	
{/if}

{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Climate action goes hand in hand with (global) human rights and racial and gender equality, it involves changing or dismantling the system of exponential growth of economic wealth (capital) built on exploitation of the resources, labour and lives of people who are deamed ‘inferior’ in a white supremacist patriarchy (doesn’t always go without saying). 
	</div>	
{/if}

{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	The first step (but not the last step) of climate action for a white westerner like myself is to practice empathy, to notice how my consumption, my practice and politics affect people in different positions of the (white supremacist, patriarchal) power structure, and to be eager to abandon or replace any habits that are having negative affects*. And if I hesitate to do this, to ask myself, what am I really fighting for? A livable future for whom?
	</div>	
{/if}

{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	*Of course nobody is perfect... yariyari... but, in a system that is designed to benefit us (to variable a extent depending on class / disability / gender expression / sexuality / etc.), the least we can do is feal a bit guilty for not being perfect, guilt alone won’t kill us. We should strive to become guilt free, but untill then realise that guilt is a [fucking] privilage!
	</div>	
{/if}

{#if sixthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	
	</div>	
{/if}

{#if seventhSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	
	</div>	
{/if}

{#if eightthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	
	</div>	
{/if}




<!-- FOOTER + STATIC -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			{#if fifthSetup}<a class="text" href="" target="_blank">[more &nearr;]</a>{/if}
			{#if sixthSetup}<a class="text" href="" target="_blank">[more &nearr;] <a href="" target="_blank">[more &nearr;].</a></a>{/if}
		</div>
</div>

<div class="horizontalLine left" style="width: 100%; top: calc(({distanceBLines} * 8) - 1px); border-top: 1px solid blue;"></div>

<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>

	.text, .text a, .pagetext {color: rgb(70,70,70) !important;}
	.verticalLine {border-right: 1px dotted rgb(70,70,70);}
	.horizontalLine {border-top: 1px dotted rgb(70,70,70); width: 100%;}
	.line {background-color: rgb(70,70,70);}
	.tempMeterCountry {
		border-left: 1px solid rgb(70,70,70); 
		border-right: 1px solid rgb(70,70,70);
	}
	.firstMeter, .midMeter, .endMeter {border-left: 1px dotted rgb(70,70,70);}
	.firstMeter {width: calc(((100% / 365) * 23) - 1px);}
	.midMeter {width: calc(((100% / 365) * 45) - 1px);}
	.endMeter {width: calc(((100% / 365) * 127) - 1px);}
	.firstMeter:after, .midMeter:after, .endMeter:after {border-right: 1px dotted rgb(70,70,70);}
	.rightFirst {right: calc(((100vw / 365) * 23) - 1px);}
	.rightMid {right: calc(((100vw / 365) * 45) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 127) - 1px);}

</style>