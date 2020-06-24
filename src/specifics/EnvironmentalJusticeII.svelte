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
		tenthSetup = false;
		eleventhSetup = true;
		twelvethSetup = false;
	}
	const toggletwelvethSetup = () => {
		eleventhSetup = false;
		twelvethSetup = true;
		thirteenthSetup = false;
	}
	const togglethirteenthSetup = () => {
		twelvethSetup = false;
		thirteenthSetup = true;
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
	<div class="buttonNext" on:click={toggletwelvethSetup}></div>
	<div class="buttonPrev" on:click={toggletenthSetup}></div>
{/if}
{#if twelvethSetup}
	<div class="buttonNext" on:click={togglethirteenthSetup}></div>
	<div class="buttonPrev" on:click={toggleeleventhSetup}></div>
{/if}
{#if thirteenthSetup}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={toggletwelvethSetup}></div>
{/if}




<!-- CONTENT -->

<div class="pagetitle" style="transform: rotate({rotate});">Radical<br>love ...</div>

{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		CARE<br>
		In order to love, we must care.<br>
		But care alone does not constitute love. bell claims that an abusive parent, although maybe caring, does not love it’s child. Abuse and love can not coexist and love can never excuse&nbsp;abuse.<!-- [Careless love -- song] -->
	</div>	
{/if}

{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		To care about the wellbeing of others than yourself is not sufficient in itself, and combined with abuse or neglect it becomes dysfunctional. Creating work for garment workers, and then only paying 2% of them a living wage, is abusive&nbsp;care. 
	</div>	
{/if}

{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		COMMITMENT<br>
		In order to love we must be eager and committed to abandoning abusive habits. Love, in bell’s writing, is not a practice for greater life satisfaction of the loving individual, but a deeply political act of ending domination and oppression, whether over yourself or another. Love is communal, “it requires conscious practice, a willingness to unite the way we think with the way we&nbsp;act.” <!--(U.N.I.T.Y. Queen Latifah)--> 
	</div>	
{/if}

{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		KNOWLEDGE<br>
		Mass media historically shows love as a mystery, something undefinable. This is linked to patriarchal values, according to bell, which depend upon inferiority/superiority, which can better be represented through violence than through love. Mass media can’t define love because the creators, mostly partriarchal institutions, don’t understand love, their ideas of love are scewed by dominance and violence.
	</div>	
{/if}

{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Representations of environmentalism in mass media is similarly underdeveloped, which is shameful because representation shapes our culture and informs our thoughts and actions. Consumers must use their power to demand nuanced representations. If love is unknowable and environmentalism is <i>kids holding hands around a globe</i>, then where does that lead&nbsp;us? What valuable knowledge are we missing out&nbsp;on? <!-- LINK TO THESIS -->
	</div>	
{/if}

{#if sixthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		RESPONSIBILITY<br>
		bell talkes of love as an action, which is informed by will and intention, rather than a feeling, which is uncontrollable. This lends love accountability and responsibility. “If we were constantly remembering that love is as love does, we would not use the word in a manner that devalues and degrades its&nbsp;meaning.”
	</div>	
{/if}

{#if seventhSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		“We can choose to love” (although I’m not so sure we can choose to not love). In a wider context &mdash; as love exists in many forms and “sizes” &mdash; when speaking of groups of people, we do not simply “not love” them, we choose to not love them, and that choice has consequences which we are responsible for. Love is not <i>just</i> a feeling that we cannot control, it is an intentional action.
	</div>	
{/if}

{#if eightthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		RESPECT<br>
		I read an article by David Wallace-Wells, where he describes an encounter he had with a middle aged business man after he had attended a panel discussion on the climate crisis which David was part of. The man asked him, in “an almost conspiratory” tone: “How bad is it going to&nbsp;be?”
	</div>	
{/if}

{#if ninethSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		David answered, surprised by the question after a 90 minute discussion, “at just 2 degrees of warming, which is basically the best-case scenario. it’s been estimated that 150 million people would die from air pollution...”, the man stopped him and commented, smiling, “But out of 8&nbsp;billion”.
	</div>	
{/if}

{#if tenthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		David continued, trying to convince the man that the - avoidable - death of 150 million people would surely be a tragedy, “...the scale of 25 Holocausts”, the man cut him off again, repeating his previous observation, as if he had proven his point. After learning of the imminent death of 150 million people, he concluded that since they where mainly concentrated in China, India and the Developing world, it wouldn’t be so&nbsp;bad.
	</div>	
{/if}

{#if eleventhSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Although most are not as vocal about this kind of disregard for human life, his attitude perfectly mirrors that of western policy. Respect for human life is conditional to class, race, gender, sexuality, religion, etc., and now also year of&nbsp;birth. 
	</div>	
{/if}

{#if twelvethSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		TRUST<br>
		Finally, love requires trust.<br>
		“As a culture we are obsessed with the notion of safety. Yet we do not question why we live in states of extreme anxiety and dread. Fear is the primary force upholding structures of domination. It promotes the desire for separation, the desire not to be known. When we are taught that safety lies always with sameness, then difference, of any kind, will appear as a threat.&nbsp;... 
	</div>	
{/if}

{#if thirteenthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		... When we choose to love we choose to move against fear-against alienation and separation. The choice to love is a choice to connect &mdash; to find ourselves in the&nbsp;other.”<br>
		To love is to trust that the other will not harm us, that difference is not destructive. “Awakening to love can happen only as we let go of our obsession with power and domination.”
	</div>	
{/if}




<!-- FOOTER + STATIC -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			{#if fifthSetup}<a class="text" href="https://kabk.github.io/go-theses-20-berglind-johannsdottir/" target="_blank"> [thesis &nearr;&#xFE0E;]</a>{/if}
			{#if eightthSetup}<a class="text" href="https://nymag.com/intelligencer/2019/12/climate-change-worst-case-scenario-now-looks-unrealistic.html" target="_blank"> [more &nearr;&#xFE0E;]</a>{/if}
			{#if ninethSetup}<a class="text" href="https://nymag.com/intelligencer/2019/12/climate-change-worst-case-scenario-now-looks-unrealistic.html" target="_blank"> [more &nearr;&#xFE0E;]</a>{/if}
			{#if tenthSetup}<a class="text" href="https://nymag.com/intelligencer/2019/12/climate-change-worst-case-scenario-now-looks-unrealistic.html" target="_blank"> [more &nearr;&#xFE0E;]</a>{/if}
			<a class="text" href="https://www.youtube.com/watch?v=LTRDHb-8EF0" target="_blank"> [more &nearr;&#xFE0E;]</a>
			<a class="text" href="https://abc.nl/book-details/all-about-love-new-visions/@9780060959470" target="_blank"> [more &nearr;&#xFE0E;]</a>
		</div>
</div>

<div class="horizontalLine left" style="width: 100%; top: calc({distanceBLines} * 8); border-top: 1px solid blue;"></div>

<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>

	.text, .text a, .pagetext {color: rgb(70,70,70) !important;}
	.pagetext {bottom: 20%;}
	.pagetitle {bottom: 70%;}
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