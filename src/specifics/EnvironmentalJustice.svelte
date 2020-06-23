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
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={togglefifthSetup}></div>
{/if}




<!-- CONTENT -->

<div class="pagetitle" style="transform: rotate({rotate});">Environmental<br>Justice:<br>I</div>

{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Last May &mdash; the hottest on record &mdash; Icelands Minister of Justice (ironically) resubmitted a controversial proposal to change asylum legislation. If going through the legislation will limit asylum seekers’s chances, chances that are already very low, of being granted asylum in Iceland. <!-- LINK IN ENGLISH https://grapevine.is/news/2020/06/18/seeking-asylum-in-iceland-in-the-time-of-covid-19/ -->
	</div>	

	<div class="horizontalLine left line0"></div>
	<div class="text years left line0 now">2020</div>
	<!--<div class="text years right line0">2020</div>-->
{/if}

<div class="line left line0"></div>
<div class="line right line0"></div>

{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		This focus on securing borders and keeping people out has become a trend in European and U.S. politics at a time when more people than ever are forcibly displaced, many of which due to factors amplified by climate change, such as food insecurity, droughts, flooding, etc.. (all factors which can also lead to conflict that forces people to migrate)  <!-- LINK https://www.unhcr.org/figures-at-a-glance.html (also applies to next point, first sentence.)-->
	</div>	
{/if}

{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Between 2007 and 2010 Syria felt a massive drought that lead to crop failure, uprooting farmers and leading them to migrate to cities. The cities, lacking infrastructure to host so many people, became overcrowded and this (along with other factors) sparked the Syrian conflict. <!-- LINK https://theconversation.com/climate-change-and-drought-a-spark-in-igniting-syrias-civil-war-38275 -->
		<br>
		In the end of 2019, 6.6 million of the people displaced on Earth (the most people coming from a single country) came from Syria.
	</div>	

	<div class="horizontalLine left line13"></div>
	<div class="text years left line13">2007</div>
	<div class="horizontalLine left line10"></div>
	<div class="text years left line10">2010</div>

	<div class="horizontalLine left line0"></div>
	<div class="text years left line0 now">2020</div>
{/if}

{#if secondSetup}
{:else}
	{#if firstSetup}
	{:else}
		<div class="line left line13"></div>
		<div class="line left line10"></div>
	{/if}
{/if}

{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		The oposite of a drought is a flood, both are becoming more common with heating. Jakarta, Indonesia’s capital city and home to roughly 9 million people, is the fastest sinking city in the world and is estimated to be half underwater in 2030. <!-- LINK https://www.youtube.com/watch?v=dNE5aptbGyY -->
	</div>	

	<div class="horizontalLine left line10"></div>
	<div class="text years right line10">2030</div>
{/if}

{#if thirdSetup}
{:else}
	{#if secondSetup}
	{:else}
		{#if firstSetup}
		{:else}
			<div class="line right line10"></div>
		{/if}
	{/if}
{/if}

{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		The climate crisis is already being felt by an increasingly large population (mostly non-white). Each year since 2008, catastrophic weather disasters have displaced an average of 24 million people. Yet no substancial measures to keep it under control have been taken.
	</div>	

	<div class="horizontalLine left line40"></div>
	<div class="text years right line40">2050</div>
{/if}

{#if fourthSetup}
{:else}
	{#if thirdSetup}
	{:else}
		{#if secondSetup}
		{:else}
			{#if firstSetup}
			{:else}
				<div class="line right line40"></div>
			{/if}
		{/if}
	{/if}
{/if}

{#if sixthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		The climate crisis is already being felt by an increasingly large population (mostly non-white), yet no substancial measures to keep it under control have been taken. As it seems, more powder is being put into securing north-western borders and keeping the problem out of sight and out of mind. Out of mostly white and white governed high CO<sub>2</sub> emitting countries that take a very active part in fueling the crisis... like Iceland.
	</div>	
{/if}





<!-- FOOTER + STATIC -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			{#if fifthSetup}<a class="text" href="https://www.weforum.org/agenda/2019/10/importance-of-disaster-risk-reduction/" target="_blank">[more &nearr;]</a>{/if}
			<!--{#if sixthSetup}<a class="text" href="" target="_blank">[more &nearr;] <a href="" target="_blank">[more &nearr;].</a></a>{/if}-->
		</div>
</div>

<div class="horizontalLine left" style="width: 100%; top: calc({distanceBLines} * 8); border-top: 1px solid blue;"></div>

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