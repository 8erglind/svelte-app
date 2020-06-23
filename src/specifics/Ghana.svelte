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
		ninethSetup = false;
	}
	const toggleninethSetup = () => {
		eightthSetup = false;
		ninethSetup = true;
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
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={toggleeighthSetup}></div>
{/if}




<!-- CONTENT -->

<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>


{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Ghana is one of countries which rank low when it comes to the impact of individual climate action.
	</div>	
{/if}

{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		In 1957 Ghana became the first Sub-Saharan country to gain independance from colonial rule. The British colonisers where defeated by and independence movement lead by Kwame Nkrumah.  <!--[picture of him wearing kinte cloth??]-->
	</div>	

	<div class="horizontalLine left line63"></div>
	<div class="text years left line63">1957</div>
{/if}

{#if firstSetup}
{:else}
	<div class="line left line63"></div>
{/if}


{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Felicia Abban, Kwame Nkrumah’s official photographer, was the first professional woman photographer in Ghana. She ran a studio in Accra for decades and documented the evolution of Ghanian culture after it’s independence. She often photographed people, including herself. She photographed herself each night that she got dressed up to go out &ndash; for years.
	</div>	
{/if}

{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Ghana is the birthplace of Highlife, which is a certain type of guitar (dance) music. E.T. Mensah was the pioneer of highlife, and it is still going today through different styles.<!--(My personal favourite is Koo Nimo) + Gyedu-Blay Ambolley - Simi Rapp -->
	</div>	
{/if}

{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		The capital, Accra, is a port city. And to that port western countries ship their old clothes. An average of 15 million clothing items (the population of Ghana is 30 million people) flow through Kantamanto, Accra’s largest second-hand market, every week. A lot of the clothes are unsellable/unmendable so much of it ends up in landfill and only around 20% of the market's retailers make a profit.
	</div>	

	<div class="horizontalLine left line0"></div>
	<div class="text years left line0 now">2020</div>
{/if}

{#if fourthSetup}
{:else}
	{#if thirdSetup}
	{:else}
		{#if secondSetup}
		{:else}
			{#if firstSetup}
			{:else}
				<div class="line left line0"></div>
			{/if}
		{/if}
	{/if}
{/if}

{#if sixthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		The clothing, which is sent from the U.S., Canada and Europe, is called ‘Obroni w’awu’ (dead white mans clothing), because Ghanians first assumed the owners were deseased. Kayayei, the women who carry the clothing &ndash; in heavy bales on their heads &ndash; from the harbour to the market earn around 30 cents to $1 for each trip and are considered slaves of the fashion industry.
	</div>	
{/if}

{#if seventhSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		sfsdfsf
	</div>	

	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 342 900 342 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature firstMeter"><span class="deathToll text">&#10013;&#xFE0E; 3.170</span></div>
		<div class="temperature infotext"><span class="tempnumber rightFirst text">23 days</span></div>
	</div>

	<div class="text years right line0 now">2020</div>
	<div class="horizontalLine full right line0"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if sixthSetup}
{:else}
	{#if fifthSetup}
	{:else}
		{#if fourthSetup}
		{:else}
			{#if thirdSetup}
			{:else}
				{#if secondSetup}
				{:else}
					{#if firstSetup}
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
{/if}


{#if eightthSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 320 600 320 900 342 900 342 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature midMeter"><span class="deathToll text">&#10013;&#xFE0E; 8.721</span></div>
		<div class="temperature infotext"><span class="tempnumber rightMid text">45 days</span></div>
	</div>

	<div class="text years right line40">2060</div>
	<div class="horizontalLine full right line40"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}


{#if ninethSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 238 0 238 300 320 600 320 900 342 900 342 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature endMeter"><span class="deathToll text">&#10013;&#xFE0E; 38.157</span></div>
		<div class="temperature infotext"><span class="tempnumber rightEnd text">127 days</span></div>
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
			{#if fifthSetup}<a href="https://deadwhitemansclothes.org/intro" target="_blank">[more &nearr;]</a>{/if}
			{#if sixthSetup}<a href="https://www.instagram.com/p/B5VfzzlhmOv/" target="_blank">[more &nearr;]</a> <a href="https://www.instagram.com/tv/B-Sltgypx7O/" target="_blank">[more &nearr;]</a>{/if}
		</div>
</div>


<div class="horizontalLine left" style="width: 100%; top: calc({distanceBLines} * 8); border-top: 1px solid blue;"></div>


<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>
	.text, .text a, .pagetext {color: yellowgreen !important;}
	.verticalLine {border-right: 1px dotted yellowgreen;}
	.horizontalLine {border-top: 1px dotted yellowgreen; width: 100%;}
	.line {background-color: yellowgreen;}
	.tempMeterCountry {
		border-left: 1px solid yellowgreen; 
		border-right: 1px solid yellowgreen;
	}
	.firstMeter, .midMeter, .endMeter {border-left: 1px dotted yellowgreen;}
	.firstMeter {width: calc(((100% / 365) * 23) - 1px);}
	.midMeter {width: calc(((100% / 365) * 45) - 1px);}
	.endMeter {width: calc(((100% / 365) * 127) - 1px);}
	.firstMeter:after, .midMeter:after, .endMeter:after {border-right: 1px dotted yellowgreen;}
	.rightFirst {right: calc(((100vw / 365) * 23) - 1px);}
	.rightMid {right: calc(((100vw / 365) * 45) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 127) - 1px);}


</style>