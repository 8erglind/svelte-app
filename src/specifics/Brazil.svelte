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
		fifthSetup = true;

		sixthSetup = true;
		seventhSetup = false;
	}
	const toggleseventhSetup = () => {
		fifthSetup = true;

		sixthSetup = false;
		seventhSetup = true;
		eightthSetup = false;
	}
	const toggleeighthSetup = () => {
		fifthSetup = true;

		seventhSetup = false;
		eightthSetup = true;
		ninethSetup = false;
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





<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>


{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		In 1968, Caetano Velose released an album called Tropicália. This album gave name to a new cultural movement or aesthetic in Brazilian music, art and ideology.
	</div>	

	<div class="horizontalLine left line52"></div>
	<div class="text years left line52">1968</div>

	<iframe class="video" style="top: calc({distanceBLines} * 0); right: 10vw;" src="https://www.youtube.com/embed/1Z1qNsm-NUk?controls=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

	<iframe class="video" style="top: calc({distanceBLines} * 1); left: 10vw;" src="https://www.youtube.com/embed/mlm_SIw2YnI?controls=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
{/if}

<div class="line left line52"></div>


{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		At the time Brazil’s political climate was very binary. It was ruled by a far-right military dictatorship and had a large nationalstic left-wing opposition. 
		Tropicália, while also opposing the dictatorship, was opposed to the nationalistic ideology of the left. It fought for freedom of expression and sought influence from U.S. and British pop culture (which caused the nationalistic left to dislik them). “We thought there was no reason to fear the inevitable but not nesseccarily harmful influence of international mass culture.” &ndash; Caetano Veloso
	</div>

	<div class="horizontalLine left line52"></div>
	<div class="text years left line52">1968</div>

	<iframe class="video" style="top: calc({distanceBLines} * 0); left: 0vw;" src="https://www.mixcloud.com/widget/iframe/?light=1&hide_artwork=1&autoplay=1&feed=%2Fmofgimmers%2Ftropicalismo-brazilian-psychedelia-tropicalia-and-more%2F" frameborder="0" allow="autoplay"></iframe>
{/if}

{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Carmen Miranda “they say I was Americanized”.
		<!-- LINK Disseram Que Eu Voltei Americanizada song written for Carmen Miranda -> show her  -->
	</div>

	<div class="horizontalLine left line80"></div>
	<div class="text years left line80">1940</div>

	<iframe src="https://open.spotify.com/embed/track/3MAfY28yoCNbHhtZAGwYln" class="video" style="top: calc({distanceBLines} * 0); left: 10vw; height: auto !important;" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
{/if}

{#if firstSetup}
{:else}
	{#if secondSetup}
	{:else}
		<div class="line left line80"></div>
	{/if}
{/if}

{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		The same year as Tropicália was released, 1968, Paulo Freire released the book ‘Pedogogy of the Oppressed.<br>
		In it he writes about the problem of dehumanisation,  which is perpetrated through injustice, exploitation, oppression and violence. He states that humankind’s central focus should be &ndash; contrary to dehumanisation &ndash; on humanization. He called the struggle of liberation an act of love, a radical love of recognising everybody’s humanity.
	</div>

	<div class="horizontalLine left line52"></div>
	<div class="text years left line52">1968</div>
{/if}

{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		He establishes the difference between the opressor and the oppressed, and the way in which their status affects their thinking. That overall, oppressors will prioritize “their right to live in peace” (and will often view the oppressed’s response to oppression as violent (see current ‘Black Lives Matter’ movement)), and that their idea of “peace” is a state in which they hold power by capitalising on the lives of others, a state that depends on the opression. He calls them “necrophilic” (life-killing).
	</div>
{/if}





<!-- GRAPH -->
{#if firstSetup}
{:else}
	{#if secondSetup}
	{:else}
		{#if thirdSetup}
		{:else}
			{#if fourthSetup}
			{:else}
				{#if fifthSetup}
				{:else}
					<div class="tempMeterCountry">
						<div class="temperature infotext">
							<span class="tempnumber left text" style="z-index: 99999999;">365 days</span>
						</div>
					</div>
				{/if}
			{/if}
		{/if}
	{/if}
{/if}

{#if sixthSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 353 900 353 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature firstMeter"><span class="deathToll text narrow">&#10013;&#xFE0E; 10.474</span></div>
		<div class="temperature infotext"><span class="tempnumber rightFirst text">12 days</span></div>
	</div>

	<div class="text years right line0 now">2020</div>
	<div class="horizontalLine full right line0"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if seventhSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 336 600 336 900 353 900 353 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature midMeter"><span class="deathToll text narrow">&#10013;&#xFE0E; 26.566</span></div>
		<div class="temperature infotext"><span class="tempnumber rightMid text">29 days</span></div>
	</div>

	<div class="text years right line40">2060</div>
	<div class="horizontalLine full right line40"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if eightthSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 279 0 279 300 336 600 336 900 353 900 353 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature endMeter"><span class="deathToll text narrow">&#10013;&#xFE0E; 66.227</span></div>
		<div class="temperature infotext"><span class="tempnumber rightEnd text">86 days</span></div>
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
			{#if secondSetup}<a href="https://www.youtube.com/watch?v=DUPxYBNS750" target="_blank">[more &nearr;&#xFE0E;]</a>{/if}
			{#if fifthSetup}<a href="https://www.litcharts.com/lit/pedagogy-of-the-oppressed/chapter-1" target="_blank">[more &nearr;&#xFE0E;]</a>{/if}
		</div>
</div>


<div class="horizontalLine left" style="width: 100%; top: calc(({distanceBLines} * 8) - 1px); border-top: 1px solid blue;"></div>


<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>

	.text, .text a, .pagetext {color: limegreen !important;}
	.verticalLine {border-right: 1px dotted limegreen;}
	.horizontalLine {border-top: 1px dotted limegreen; width: 100vw;}
	.line {background-color: limegreen;}
	.tempMeterCountry {
		border-left: 1px solid limegreen; 
		border-right: 1px solid limegreen;
	}
	.firstMeter, .midMeter, .endMeter {border-left: 1px dotted limegreen;}
	.firstMeter {width: calc(((100% / 365) * 12) - 1px);}
	.midMeter {width: calc(((100% / 365) * 29) - 1px);}
	.endMeter {width: calc(((100% / 365) * 86) - 1px);}
	.firstMeter:after, .midMeter:after, .endMeter:after {border-right: 1px dotted limegreen;}
	.rightFirst {right: calc(((100vw / 365) * 12) - 1px);}
	.rightMid {right: calc(((100vw / 365) * 29) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 86) - 1px);}

</style>