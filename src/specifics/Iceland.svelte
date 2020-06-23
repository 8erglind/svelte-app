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
	let tenthSetup = false;
	let eleventhSetup = false;
	let twelvethSetup = false;
	let thirteenthSetup = false;
	let fourteenthSetup = false;

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
		tenthSetup = false;
	}
	const toggletenthSetup = () => {
		ninethSetup = false;
		tenthSetup = true;
		eleventhSetup = false;
	}
	const toggleeleventhSetup = () => {
		tenthSetup = true;
		eleventhSetup = true;
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






<!-- CONTENT -->

<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>


{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Iceland is a high consumer of fast fashion, since 2010 the Red Cross recieves tonnes of used clothing annually, most of which is exported either for recycling in Eurpe or to devoloping countries.
	</div>	
	<div class="text years left line10">2010</div>
	<div class="horizontalLine full left line10"></div>
	<div class="text years left line0 now">2020</div>
	<div class="horizontalLine full left line0"></div>
{/if}
<div class="line left line10"></div>
<div class="line left line0"></div>
<div class="line right line0"></div>

{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Icelanders were a former colony of Denmark, and gained full Independance in 1944.
	</div>	

	<div class="text years left line76">1944</div>
	<div class="horizontalLine full left line76"></div>
{/if}

{#if firstSetup}{:else}
	<div class="line left line76"></div>
{/if}

{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Four years earlier, a few months into World War II, Iceland was occupied by the British military. Most of the soldiers resided in the capital, causing young male soldiers to become around 1/3 of the population.
	</div>	

	<div class="text years left line80">1940</div>
	<div class="horizontalLine full left line80"></div>
{/if}

{#if firstSetup}{:else}
	{#if secondSetup}{:else}
		<div class="line left line80"></div>
	{/if}
{/if}

{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		This caused what was called Ástandið (The Situation), in which single women started hanging out with soldiers to much dismay of the wider public and the government, which’s main concern was that Icelandic women would birth mixed children which would “pollute” the pure Icelandic race. Women who were in the “situation” were spyed on by a police-team which documented their conduct in what was the largest spying opperation ever conducted in Iceland, for a short period, laws were even changed so that the age of “independance” became 20 instead of 16.
	</div>	

	<div class="text years left line80">1940</div>
	<div class="horizontalLine full left line80"></div>

	<div class="text years left line75">1945</div>
	<div class="horizontalLine full left line75"></div>
{/if}

{#if firstSetup}{:else}
	{#if secondSetup}{:else}
		{#if thirdSetup}{:else}
			<div class="line left line75"></div>
		{/if}
	{/if}
{/if}

{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		In 1941, when the U.S. army replaced the British, the Icelandic government requested specifically that black soldiers would not be sent to Iceland. An oral agreement of that matter was kept until 1963, when a chosen few, “three or four” black family-men where allowed over.
	</div>	

	<div class="text years left line79">1941</div>
	<div class="horizontalLine full left line79"></div>

	<div class="text years left line57">1963</div>
	<div class="horizontalLine full left line57"></div>
{/if}

{#if firstSetup}{:else}
	{#if secondSetup}{:else}
		{#if thirdSetup}{:else}
			{#if fourthSetup}{:else}
				<div class="line left line57"></div>
			{/if}
		{/if}
	{/if}
{/if}

{#if sixthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		During this period “ballmenning” became more prominent with a subsequent boost to the music industry, which grew from this point with foreign influence. TÓNLIST TÓNLIST TÓNLIST
	</div>

	<div class="sweatdropLarger" style="top: calc(({distanceBLines}*3.5) - 60px); left: 60vw;">
		<iframe style="position: absolute; width: 100%; height: 100%; border-radius: 60px;" src="https://www.youtube.com/embed/BBcweZR5PcE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
	</div>
{/if}

{#if seventhSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		TÓNLIST TÓNLIST TÓNLIST 1
	</div>
{/if}

{#if eightthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		TÓNLIST TÓNLIST TÓNLIST 2
	</div>
{/if}

{#if ninethSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Although it is branded as a green/clean country, Iceland is one of the largest polluters /CO2 emitters per capita. Despite a 99% renewable energy supply, it’s Consumption-Based Carbon Footprint (CBCF) (as explained briefly in India’s page) is similar to or higher than most EU nations. A majority of Icelandic household CBCF is linked to imported goods, meaning the CO2 burden of Icelandic consumption falls to a large extent on developing nations.
	</div>
{/if}

{#if tenthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		One migh assume that Iceland's disregard for actual sustainability could be linked to the fact that warming in Iceland will not reach extreme hights in the forseeable future, and it's position as an island way up north allows it to close itself off to those affected... 
	</div>
{/if}

{#if eleventhSetup}
	<div class="tempMeterCountry">
		<div class="temperature infotext"><span class="tempnumber left text" style="z-index: 99999999;">365 days</span></div>
	</div>
	<div class="tempMeterCountry">
		<div class="temperature midMeter"><span class="deathToll text narrow">&#10013;&#xFE0E; 0</span></div>
		<div class="temperature infotext"><span class="tempnumber rightFirst text">0 days</span></div>
	</div>

	<div class="text years right line0 now">2020</div>
	<div class="horizontalLine full right line0"></div>

	<div class="text years right line80">2100</div>
	<div class="horizontalLine full right line80"></div>
	<div class="line right line80"></div>
{/if}







<!-- FOOTER + STATIC -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			{#if firstSetup}<a href="https://skemman.is/bitstream/1946/28057/1/%C3%81hrif%20neysluhyggju%20%C3%A1%20t%C3%ADsku%20og%20fatai%C3%B0na%C3%B0%20.pdf" target="_blank">[more &nearr;&#xFE0E;]</a>{/if}

			{#if thirdSetup}<a href="https://skemman.is/bitstream/1946/15010/1/MA_snidmat-Alma.pdf" target="_blank">[more &nearr;&#xFE0E;]</a>{/if}

			{#if fourthSetup}<a href="https://www.ruv.is/thaettir/astandsborn" target="_blank">[more &nearr;&#xFE0E;]</a> <a href="https://www.ruv.is/frett/stridsarin-a-islandi-fyrsti-thattur" target="_blank">[more &nearr;&#xFE0E;]</a>{/if}

			{#if fifthSetup}<a href="https://timarit.is/page/3428779#page/n17/mode/2up" target="_blank">[more &nearr;&#xFE0E;]</a>{/if}

			{#if ninethSetup}<a href="https://www.sciencedirect.com/science/article/pii/S0959652617318267" target="_blank">[more &nearr;&#xFE0E;]</a>{/if}

			{#if eleventhSetup}<a href="http://www.impactlab.org/map/#usmeas=absolute&usyear=1981-2010&gmeas=absolute&gyear=2080-2099&tab=global&grcp=rcp85&gprob=0.5&gvar=tasmax-over-95F" target="_blank">[more &nearr;&#xFE0E;]</a>{/if}
		</div>
</div>


<div class="horizontalLine left" style="width: 100%; top: calc({distanceBLines} * 8); border-top: 1px solid blue;"></div>


<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>

	.text, .text a, .pagetext {color: mediumblue !important;}
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


	.falling {top: 30%; left: 40vw;}
	/*.falling {
		animation-name: example; 
    	transition-timing-function: ease-in-out;
	    animation-duration: 10s;  
	    animation-fill-mode: forwards;
	    animation-delay: 2s;
	    opacity: 0; top: 30%; left: 70vw;
	}
	@keyframes example {
	  0% {top: 30%; left: 70vw; opacity: 0;}
	  2% {opacity: 1;}
	  100% {top: calc(90% - 85px); left: 0px; opacity: 1;}
	}
	.falling2 {
		animation-name: exampletwo;
    	animation-fill-mode: forwards;
    	transition-timing-function: ease-in-out;
	    animation-duration: 10s;  
	    animation-delay: 7s;
	    opacity: 0; top: 30%; left: 5vw;
	}
	@keyframes exampletwo {
	  0% {top: 30%; left: 5vw; opacity: 0;}
	  2% {opacity: 1;}
	  100% {top: calc(97% - 85px); left: calc(100vw - 25px); opacity: 1;}
	}*/

</style>