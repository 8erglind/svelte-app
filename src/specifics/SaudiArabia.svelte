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
		
		graph = false;
	}
	const togglefifthSetup = () => {
		//fourthSetup = false;
		fifthSetup = true;
		sixthSetup = false;
		
		graph = true;
	}
	const togglesixthSetup = () => {
		fifthSetup = false;
		sixthSetup = true;
		seventhSetup = false;
		
		graph = true;
	}
	const toggleseventhSetup = () => {
		sixthSetup = false;
		seventhSetup = true;
		
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
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={togglesixthSetup}></div>
{/if}





<!-- CONENT -->


<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>





{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Saudi Arabia is one of the highest ranking countries when it comes to the impact of individual climate action.
	</div>	
{/if}

{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		In the 1930’s, an American oil company, a predecessor of Chevron, started looking for oil in Saudi Arabia and launched ARAMCO (American Arabian Oil Company).<br>
		In the 70’s the Saudi government bought ARAMCO and today it is one of the largest oil companys in the world, one of the oil giants fueling the crisis.
	</div>	
	<!-- Link history of Aramco: https://www.saudiaramco.com/en/who-we-are/overview/our-history -->

	<div class="horizontalLine left line47" style="width: 100%;"></div>
	<div class="text years left line47">1973</div>
	<div class="line left line47"></div>

	<div class="horizontalLine left line40" style="width: 100%;"></div>
	<div class="text years left line40">1980</div>
	<div class="line left line40"></div>
{:else}
	{#if firstSetup}
	{:else}
		<div class="line left line47"></div>
		<div class="line left line40"></div>
	{/if}
{/if}

{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		In the last decades of the 20th century, following a wealth boost from the oil industry, the short story became a popular artform, specifically for women. They found in it a compact format to express social critisicm with intense focus that could be delivered to the reader before interruption or fatigue kicked in. This wave included writers such as Fawziyya Al-bakr, Badriyya Al-Bisher, Maryam al-Ghamidi, Noura al-Ghamidim, Umaima al-Khamees, Khairiyya Ibrahim al-Saqqaf and Shareefa al-Shamlan.
	</div>	

	<!-- LINK https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3276448 -->

	<div class="horizontalLine left line40" style="width: 100%;"></div>
	<div class="text years left line40">1980</div>
	<div class="line left line40"></div>

	<div class="horizontalLine left line20" style="width: 100%;"></div>
	<div class="text years left line20">2000</div>
	<div class="line left line20"></div>
{:else}
	{#if firstSetup}
	{:else}
		{#if secondSetup}
		{:else}
			<div class="line left line40"></div>
			<div class="line left line20"></div>
		{/if}
	{/if}
{/if}

{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		<i>"I’m the woman from the lands of scorching heat, and of sharp freezing cold that twists the bones. Night falls early within the limits of my small village, and all living creatures take refuge inside their own skins. I’m the woman who has nothing, in her world, but the chance to stand secretly on tiptoe, gazing at the world outside through cracks in the small window. The narrow cages that shut life in haven’t stopped her eyes from looking up – with an aimless gaze sometimes, it’s true – towards some undefined future."</i>
	</div>	

	<!-- A Paper Life by Fawziyya al-Bakr -->
	<!-- She was also one of the 47 women who protested for women's right to drive in 1990: https://saudijeans.org/tag/fawzia-al-bakr/  and  https://www.newyorker.com/news/news-desk/saudi-arabias-driven-women -->


	<!--<div class="horizontalLine left line40" style="width: 100%;"></div>
	<div class="text years left line40">1980</div>

	<div class="horizontalLine left line20" style="width: 100%;"></div>
	<div class="text years left line20">2000</div>-->
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
		<polygon class="cls-1" points="365 1200 365 900 344 900 344 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature firstMeter"><span class="deathToll text">&#10013;&#xFE0E; 3.114</span></div>
		<div class="temperature infotext"><span class="tempnumber rightFirst text">21 days</span></div>
	</div>

	<div class="text years right line0 now">2020</div>
	<div class="horizontalLine full right line0"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if sixthSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 328 600 328 900 344 900 344 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature midMeter"><span class="deathToll text">&#10013;&#xFE0E; 6.441</span></div>
		<div class="temperature infotext"><span class="tempnumber rightMid text">37 days</span></div>
	</div>

	<div class="text years right line40">2060</div>
	<div class="horizontalLine full right line40"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if seventhSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 292 0 292 300 328 600 328 900 344 900 344 1200 365 1200"/>
	</svg>

	<div class="tempMeterCountry">
		<div class="temperature endMeter"><span class="deathToll text">&#10013;&#xFE0E; 12.635</span></div>
		<div class="temperature infotext"><span class="tempnumber rightEnd text">73 days</span></div>
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
	.text, .text a, .pagetext {color: green !important;}
	.verticalLine {border-right: 1px dotted green;}
	.horizontalLine {border-top: 1px dotted green;}
	.line {background-color: green;}

	.tempMeterCountry {
		border-left: 1px solid green; 
		border-right: 1px solid green;
	}
	.firstMeter, .midMeter, .endMeter {border-left: 1px dotted green;}
	.firstMeter {width: calc(((100% / 365) * 21) - 1px);}
	.midMeter {width: calc(((100% / 365) * 37) - 1px);}
	.endMeter {width: calc(((100% / 365) * 73) - 1px);}
	.firstMeter:after, .midMeter:after, .endMeter:after {border-right: 1px dotted green;}

	.rightFirst {right: calc(((100vw / 365) * 21) - 1px);}
	.rightMid {right: calc(((100vw / 365) * 37) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 73) - 1px);}

</style>